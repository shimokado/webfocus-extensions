@REM プログラム内容を表示しない
@ECHO OFF

ECHO Deploying extension module to WebFOCUS...

@REM 拡張機能フォルダをWebFOCUSにデプロイする
@REM デプロイ先フォルダ C:\ibi\WebFOCUS93\config\web_resource\extensions

@REM カレントディレクトリをスクリプトのディレクトリに変更
cd /d %~dp0
cd ..

@REM デプロイ先のフォルダにコピー

@REM デプロイする拡張機能IDを第一引数として受け取る
@REM 入力が無ければエラー
IF "%1"=="" GOTO ERROR

@REM デプロイする拡張機能ID
SET EXTENSION_ID=%1

@REM 拡張機能IDの前にcom.shimokadoを付与
SET FULL_EXTENSION_ID=com.shimokado.%EXTENSION_ID%

@REM 拡張機能のフォルダ
SET EXTENSION_FOLDER=%FULL_EXTENSION_ID%

@REM 拡張機能のフォルダが存在しなければエラー
IF NOT EXIST %EXTENSION_FOLDER% GOTO ERROR1

@REM デプロイ先のフォルダ
SET DEPLOY_FOLDER=C:\ibi\WebFOCUS93\config\web_resource\extensions

@REM デプロイ先にコピーフォルダが存在しなければ作成
IF NOT EXIST %DEPLOY_FOLDER%\%FULL_EXTENSION_ID% MKDIR %DEPLOY_FOLDER%\%FULL_EXTENSION_ID%

@REM 拡張機能のフォルダをデプロイ先にコピー
XCOPY /E /Y /I %EXTENSION_FOLDER% %DEPLOY_FOLDER%\%FULL_EXTENSION_ID% > NUL

@REM Tomcat9WFを再起動するか確認
SET /P RESTART=Do you want to restart Tomcat? [y/n]

@REM Tomcat9WFを再起動
IF /I "%RESTART%"=="y" (
    @REM 管理者権限で別プロンプトを開いてTomcatサービスを再起動
    powershell -Command "Start-Process cmd -Verb RunAs -ArgumentList '/k net stop Tomcat9WF & net start Tomcat9WF & exit'"
)

@REM 正常終了
GOTO END

@REM エラー処理
:ERROR
ECHO Please specify the extension ID to deploy.
ECHO Usage: deploy_extension_module.bat [extension ID]
GOTO END

@REM エラー処理
:ERROR1
ECHO Extension folder does not exist. %EXTENSION_FOLDER%
GOTO END

@REM 終了処理
:END



