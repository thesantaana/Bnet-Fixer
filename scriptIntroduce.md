### 第一部分：更新后的增强版脚本 (Enhanced Script)

**更新说明：**

- 保持**全英文界面**以确保 100% 无乱码。
- **智能错误报告**：如果删除文件夹失败，会提示“Files in use (文件被占用)”；如果服务启动失败，会提示“Service Disabled (服务被禁用)”。
- 保留了开头和结尾的 `y/n` 确认逻辑。

请复制以下代码保存为 `.bat` 文件：

代码段

```
@echo off
setlocal EnableDelayedExpansion

:: ========================================================
:: 1. AUTO-ELEVATE TO ADMIN
:: ========================================================
>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"
if '%errorlevel%' NEQ '0' (
    echo Requesting Administrator rights...
    goto UACPrompt
) else ( goto gotAdmin )

:UACPrompt
    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
    echo UAC.ShellExecute "%~s0", "", "", "runas", 1 >> "%temp%\getadmin.vbs"
    "%temp%\getadmin.vbs"
    exit /B

:gotAdmin
    if exist "%temp%\getadmin.vbs" ( del "%temp%\getadmin.vbs" )
    pushd "%CD%"
    CD /D "%~dp0"

cls
echo ========================================================
echo   Battle.net Repair Tool (Diagnostic Edition)
echo ========================================================
echo.
echo   Actions to be performed:
echo   1. Kill Battle.net processes
echo   2. Deep Clean Cache (with Error Reporting)
echo   3. Reset Network & Enable Secondary Logon Service
echo.

:: ========================================================
:: 2. START CONFIRMATION
:: ========================================================
:AskStart
set /p UserInput=Would you like to run this script now? (y/n): 
if /i "%UserInput%"=="n" exit
if /i "%UserInput%" NEQ "y" goto AskStart
echo.

:: ========================================================
:: STEP 1: KILL PROCESSES
:: ========================================================
echo [1/3] Killing Processes...
taskkill /f /im Battle.net.exe >nul 2>&1
taskkill /f /im Agent.exe >nul 2>&1
taskkill /f /im "Battle.net Launcher.exe" >nul 2>&1
taskkill /f /im "Blizzard Battle.net App.exe" >nul 2>&1
echo       Status: [Done] (If running, they are now closed)
echo.

:: ========================================================
:: STEP 2: DELETE CACHE (With Error Checks)
:: ========================================================
echo [2/3] Deleting Cache Files...

:: Stop Agent Service first
net stop "Battle.net Update Agent" >nul 2>&1

:: Function to delete and check errors
call :SafeDelete "%ProgramData%\Battle.net"
call :SafeDelete "%ProgramData%\Blizzard Entertainment"
call :SafeDelete "%AppData%\Battle.net"
call :SafeDelete "%LocalAppData%\Battle.net"
call :SafeDelete "%LocalAppData%\Blizzard Entertainment"

:: Registry Clean
reg delete "HKEY_CURRENT_USER\Software\Blizzard Entertainment" /f >nul 2>&1
if %errorlevel% NEQ 0 (
    echo       [Registry] Warning: Could not delete registry key (or key not found).
) else (
    echo       [Registry] Cleaned.
)
echo.

:: ========================================================
:: STEP 3: NETWORK & SERVICE FIX
:: ========================================================
echo [3/3] Resetting Network & Services...

:: Fix Secondary Logon
sc config seclogon start= auto >nul 2>&1
if %errorlevel% NEQ 0 (
    echo       [Error] Could not configure 'Secondary Logon' service.
    echo               Reason: Access Denied or Service Disabled by Policy.
) else (
    net start seclogon >nul 2>&1
    echo       [Service] Secondary Logon set to Auto.
)

:: Network Resets
ipconfig /flushdns >nul 2>&1
netsh int ip reset >nul 2>&1
if %errorlevel% NEQ 0 echo       [Network] TCP/IP Reset failed (Check Group Policy).
netsh winsock reset >nul 2>&1
if %errorlevel% NEQ 0 echo       [Network] Winsock Reset failed.

echo       Status: [Done]
echo.

:: ========================================================
:: END CONFIRMATION & RESTART
:: ========================================================
echo ========================================================
echo                  REPAIR COMPLETE
echo ========================================================
echo.

:AskRestart
set /p RestartInput=Would you like to RESTART your computer now? (y/n): 
if /i "%RestartInput%"=="y" (
    echo.
    echo Restarting in 3 seconds...
    shutdown /r /t 3
    exit
)
if /i "%RestartInput%"=="n" (
    echo.
    echo [IMPORTANT] Please remember to RESTART MANUALLY later.
    echo Press any key to exit...
    pause >nul
    exit
)
goto AskRestart

:: ========================================================
:: SUB-ROUTINE: Safe Delete Helper
:: ========================================================
:SafeDelete
if exist "%~1" (
    rd /s /q "%~1" >nul 2>&1
    if exist "%~1" (
        echo       [!] FAILED to delete: "%~1"
        echo           Reason: Files are in use or Access Denied.
    ) else (
        echo       [OK] Deleted: "%~1"
    )
)
exit /b
```

------

### 第二部分：脚本功能介绍与故障排查手册

您可以将下文直接复制整理成文档发送给用户。

------

# Battle.net 强力修复工具使用指南

## 一、 脚本功能介绍

本工具旨在解决战网安装失败、卡更新、以及无法启动的问题（特别是错误代码 `BLZBNTBTS0000005D`）。它通过“清理残留”和“修复环境”两个维度进行深度修复。

**核心功能模块：**

1. **进程查杀 (Kill Processes)：**
   - 自动检测并强制结束所有暴雪相关的后台进程（包括 Agent.exe, Battle.net.exe 等），防止因文件被占用导致修复失败。
2. **深度缓存清理 (Deep Cache Clean)：**
   - 删除位于 `%ProgramData%`, `%AppData%`, `%LocalAppData%` 下的所有战网相关文件夹。
   - 清除注册表中相关的配置项。
   - *作用：解决因旧文件损坏、版本冲突导致的安装错误。*
3. **环境与服务修复 (Network & Service)：**
   - **开启 Secondary Logon 服务**：这是战网更新代理必须依赖的系统服务，脚本会自动将其设为“自动启动”。
   - **网络重置**：执行 DNS 刷新、Winsock 重置和 TCP/IP 重置。
   - *作用：解决连接服务器失败、更新卡住不动的问题。*

------

## 二、 常见错误提示与解决方案

脚本运行过程中，如果出现红色或带有 `[!] FAILED` 字样的提示，请参考以下方案：

### 1. 提示 `[!] FAILED to delete: ...` (无法删除文件)

- **错误原因**：
  - 战网的核心进程仍在后台运行，或者文件被其他软件（如杀毒软件、文件资源管理器）占用。
  - 权限不足。
- **解决方案**：
  1. 重启电脑。
  2. 开机后**不要打开任何软件**，直接再次运行本脚本。
  3. 暂时关闭 360、火绒、迈克菲等杀毒软件。

### 2. 提示 `Access Denied` 或 `Requesting Administrator rights...` 循环

- **错误原因**：
  - 当前 Windows 账户权限不足。
- **解决方案**：
  - 请务必**右键点击脚本**，选择 **“以管理员身份运行” (Run as Administrator)**。

### 3. 提示 `[Error] Could not configure 'Secondary Logon'`

- **错误原因**：
  - 您的 Windows 系统是一个精简版（Ghost版），该服务被系统彻底移除或禁用了。
- **解决方案**：
  - 按 `Win + R` 键，输入 `services.msc` 打开服务列表。
  - 手动寻找 `Secondary Logon`。如果找不到，说明系统缺失该组件，可能需要重装完整版 Windows 系统才能玩暴雪游戏。

------

## 三、 注意事项 (必读)

1. **必须重启**：脚本运行结束后，**必须重启电脑**才能生效。如果不重启，网络设置和服务变更无法应用。
2. **登录失效**：运行脚本后，您的战网客户端会“忘记”您的账号密码以及游戏安装路径定位。
   - *修复方法*：重启后登录战网，点击游戏下方的“定位游戏”按钮，指向您原来的游戏文件夹即可，**不需要**重新下载游戏。
3. **管理员权限**：请始终以管理员身份运行安装程序和本脚本。