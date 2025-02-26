@echo off
@REM テストする拡張機能IDを第一引数として受け取る
@REM 入力が無ければエラー
IF "%1"=="" GOTO ERROR

@REM テストする拡張機能ID
SET EXTENSION_ID=%1

@REM 拡張機能IDの前にcom.shimokadoを付与
SET FULL_EXTENSION_ID=com.shimokado.%EXTENSION_ID%

@REM 親のフォルダをプロジェクトのルートに設定
SET PROJECT_ROOT=%CD%

@REM test.htmlのパス
SET TEST_FILE=%PROJECT_ROOT%\%FULL_EXTENSION_ID%\test.html

@REM test.htmlが存在しなければエラー
IF NOT EXIST %TEST_FILE% GOTO ERROR_NO_TEST

@REM Edgeブラウザでtest.htmlを開く
start msedge %TEST_FILE%

@REM 正常終了
GOTO END

@REM エラー処理
:ERROR
ECHO テストする拡張機能IDを指定してください
GOTO END

:ERROR_NO_TEST
ECHO テストファイル %TEST_FILE% が見つかりません
GOTO END

@REM 終了処理
:END