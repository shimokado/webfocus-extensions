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

@REM 拡張機能のフォルダをデプロイ先にコピー
xcopy /s /e /y %EXTENSION_FOLDER% %DEPLOY_FOLDER%

@REM 正常終了
GOTO END

@REM エラー処理
:ERROR
ECHO デプロイする拡張機能IDを指定してください
GOTO END

@REM 終了処理
:END


