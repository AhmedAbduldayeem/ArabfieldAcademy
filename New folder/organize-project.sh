#!/bin/bash

# سكريبت تنظيم المشروع - لينكس/ماك
# احفظه في المجلد الرئيسي للمشروع

echo "🚀 بدء تنظيم مشروع الأكاديمية..."

# إنشاء المجلدات
mkdir -p assets/css
mkdir -p assets/js
mkdir -p assets/images
mkdir -p assets/fonts

# نقل الملفات
mv css/* assets/css/ 2>/dev/null
mv js/* assets/js/ 2>/dev/null
mv images/* assets/images/ 2>/dev/null
mv fonts/* assets/fonts/ 2>/dev/null

# حذل المجلدات الفارغة
rmdir css 2>/dev/null
rmdir js 2>/dev/null
rmdir images 2>/dev/null
rmdir fonts 2>/dev/null

echo "✅ تم تنظيم الملفات بنجاح!"
echo "📁 الهيكل الجديد:"
find assets -type f | sort