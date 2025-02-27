@REM 拡張機能フォルダをWebFOCUSにデプロイする
@REM デプロイ先フォルダ C:\ibi\WebFOCUS93\config\web_resource\extensions

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
IF NOT EXIST %EXTENSION_FOLDER% GOTO ERROR

@REM デプロイ先のフォルダ
SET DEPLOY_FOLDER=C:\ibi\WebFOCUS93\config\web_resource\extensions

@REM デプロイ先にコピーフォルダが存在しなければ作成
IF NOT EXIST %DEPLOY_FOLDER%\%FULL_EXTENSION_ID% MKDIR %DEPLOY_FOLDER%\%FULL_EXTENSION_ID%

@REM 拡張機能のフォルダをデプロイ先にコピー
XCOPY /E /Y /I %EXTENSION_FOLDER% %DEPLOY_FOLDER%\%FULL_EXTENSION_ID%

@REM Tomcat9WFを再起動するか確認
SET /P RESTART=Do you want to restart Tomcat9WF? (y/n)

@REM Tomcat9WFを再起動
IF /I "%RESTART%"=="y" (
    net stop Tomcat9WF
    net start Tomcat9WF
)

@REM 正常終了
GOTO END

@REM エラー処理
:ERROR
ECHO デプロイする拡張機能IDを指定してください
GOTO END

@REM 終了処理
:END


