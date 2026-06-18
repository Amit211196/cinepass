@echo off
REM CinePass CORS Configuration Helper
REM Helps configure CORS for frontend-backend communication

cls
echo ============================================
echo CinePass CORS Configuration Helper
echo ============================================
echo.

setlocal enabledelayedexpansion

echo Current CORS configuration in backend:
echo ======================================
echo.

REM Look for CORS configuration
findstr /R "cors\|CORS" Backend\src\main\java\com\capstone\cinepass\config\*.java 2>nul
if errorlevel 1 (
    echo No CORS configuration found in config files
) else (
    echo CORS configuration found above
)

echo.
echo.

echo Instructions for CORS Setup:
echo ============================
echo.

echo 1. After your frontend is deployed to CloudFront, you'll have a URL like:
echo    https://d123456.cloudfront.net
echo.

echo 2. Update the backend's CORS configuration:
echo    File: Backend\src\main\java\com\capstone\cinepass\config\SecurityConfig.java
echo    (or where your CORS configuration is)
echo.

echo 3. Add your frontend URL to allowed origins:
echo    @Configuration
echo    public class SecurityConfig {
echo        @Bean
echo        public CorsConfigurationSource corsConfigurationSource() {
echo            CorsConfiguration configuration = new CorsConfiguration();
echo            configuration.setAllowedOrigins(Arrays.asList(
echo                "http://localhost:5173",                    // Local development
echo                "https://d123456.cloudfront.net"            // CloudFront production
echo            ));
echo            configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
echo            configuration.setAllowedHeaders(Collections.singletonList("*"));
echo            configuration.setAllowCredentials(true);
echo
echo            UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
echo            source.registerCorsConfiguration("/**", configuration);
echo            return source;
echo        }
echo    }
echo.

echo 4. For quickest update, edit .ebextensions\03_proxy.config:
echo    Replace "YOUR-CLOUDFRONT-DOMAIN.cloudfront.net" with your actual domain
echo.

echo 5. Rebuild and redeploy:
echo    cd Backend
echo    mvnw.cmd clean package -DskipTests
echo    eb deploy
echo.

echo After CloudFront is fully deployed (15-30 min):
echo.

set /p FRONTEND_DOMAIN="Enter your CloudFront domain (e.g., d123456.cloudfront.net): "

if not "!FRONTEND_DOMAIN!"=="" (
    echo.
    echo Updating CORS configuration...

    REM Update the proxy config file with the actual domain
    if exist "Backend\.ebextensions\03_proxy.config" (
        REM Read the file and replace the placeholder
        for /f "delims=" %%a in ('type "Backend\.ebextensions\03_proxy.config"') do (
            set "line=%%a"
            setlocal enabledelayedexpansion
            echo !line:YOUR-CLOUDFRONT-DOMAIN.cloudfront.net=!FRONTEND_DOMAIN!
            endlocal
        ) > Backend\.ebextensions\03_proxy.config.tmp

        move /y Backend\.ebextensions\03_proxy.config.tmp Backend\.ebextensions\03_proxy.config

        echo Updated .ebextensions\03_proxy.config
        echo.
        echo To deploy these changes:
        echo   cd Backend
        echo   mvnw.cmd clean package -DskipTests
        echo   eb deploy
    )
)

echo.
echo ============================================
echo CORS Configuration Help Complete
echo ============================================

endlocal

