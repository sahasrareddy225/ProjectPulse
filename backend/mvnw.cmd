@REM ----------------------------------------------------------------------------
@REM Apache Maven Wrapper startup batch script
@REM Licensed to the Apache Software Foundation (ASF) under one or more
@REM contributor license agreements. See the NOTICE file distributed with
@REM this work for additional information regarding copyright ownership.
@REM
@REM ProjectPulse — do not modify this file manually.
@REM ----------------------------------------------------------------------------

@IF "%__MVNW_ARG0_NAME__%"=="" (SET "BASE_DIR=%~dp0") ELSE (SET "BASE_DIR=%__MVNW_ARG0_NAME__%")

@setlocal
@pushd . & cd "%BASE_DIR%"

set MAVEN_WRAPPER_PROPERTIES="%BASE_DIR%.mvn\wrapper\maven-wrapper.properties"

for /F "usebackq tokens=1,2 delims==" %%a in (%MAVEN_WRAPPER_PROPERTIES%) do (
    if "%%a"=="distributionUrl"        set "DISTRIBUTION_URL=%%b"
    if "%%a"=="wrapperUrl"             set "WRAPPER_URL=%%b"
)

set "WRAPPER_JAR=%BASE_DIR%.mvn\wrapper\maven-wrapper.jar"

if not exist "%WRAPPER_JAR%" (
    echo Downloading Maven Wrapper JAR from: %WRAPPER_URL%
    PowerShell -Command "$webclient = New-Object System.Net.WebClient; $webclient.DownloadFile('%WRAPPER_URL%', '%WRAPPER_JAR%')"
)

set WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain

set "PROJECT_DIR=%BASE_DIR%"
if "%PROJECT_DIR:~-1%"=="\" set "PROJECT_DIR=%PROJECT_DIR:~0,-1%"

java %MAVEN_WRAPPER_JAVA_OPTS% ^
    -classpath "%WRAPPER_JAR%" ^
    "-Dmaven.multiModuleProjectDirectory=%PROJECT_DIR%" ^
    "-Dmaven.wrapper.distribution.url=%DISTRIBUTION_URL%" ^
    %WRAPPER_LAUNCHER% %MAVEN_CONFIG% %*

if ERRORLEVEL 1 goto error
goto end

:error
set ERROR_CODE=1

:end
@endlocal & set ERROR_CODE=%ERROR_CODE%

if not "%MAVEN_SKIP_RC%"=="" goto skipRc

@REM check for pre/post run scripts in base dir or user home
if exist "%USERPROFILE%\mavenrc_pre.bat" call "%USERPROFILE%\mavenrc_pre.bat" %*
if exist "%BASE_DIR%\.mvn\jvm.config" (
    for /F "usebackq" %%i in ("%BASE_DIR%.mvn\jvm.config") do (
        set JVM_CONFIG_MAVEN_PROPS=%%i
    )
)
:skipRc

cmd /C exit /B %ERROR_CODE%
