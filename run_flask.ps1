# Скрипт для запуска Flask приложения
Write-Host "Запуск Flask приложения..." -ForegroundColor Green

# Активация виртуального окружения
Write-Host "Активация виртуального окружения..." -ForegroundColor Yellow
& ".\ve\Scripts\Activate.ps1"

# Установка переменных окружения Flask
Write-Host "Установка переменных окружения..." -ForegroundColor Yellow
$env:FLASK_APP = "app.py"
$env:FLASK_ENV = "development"

# Запуск Flask
Write-Host "Запуск Flask сервера..." -ForegroundColor Green
Write-Host "Приложение будет доступно по адресу: http://127.0.0.1:5000" -ForegroundColor Cyan
Write-Host "Для остановки нажмите Ctrl+C" -ForegroundColor Red
Write-Host ""

flask run 