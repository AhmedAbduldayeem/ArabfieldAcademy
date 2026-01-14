@echo off
echo 🚀 بدء تنظيم مشروع الأكاديمية...

:: إنشاء المجلدات
if not exist "assets" mkdir assets
if not exist "assets\css" mkdir assets\css
if not exist "assets\js" mkdir assets\js
if not exist "assets\images" mkdir assets\images
if not exist "assets\fonts" mkdir assets\fonts

:: نقل الملفات
if exist "css\*" move "css\*" "assets\css\"
if exist "js\*" move "js\*" "assets\js\"
if exist "images\*" move "images\*" "assets\images\"
if exist "fonts\*" move "fonts\*" "assets\fonts\"

:: حذل المجلدات الفارغة
if exist "css" rmdir "css"
if exist "js" rmdir "js"
if exist "images" rmdir "images"
if exist "fonts" rmdir "fonts"

echo ✅ تم تنظيم الملفات بنجاح!
echo 📁 الهيكل الجديد:
dir assets /s /b
pause