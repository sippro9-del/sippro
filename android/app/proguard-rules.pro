# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Capacitor specific rules
-keep class com.getcapacitor.** { *; }
-keep  class * extends com.getcapacitor.Plugin { *; }
-keep  class * extends com.getcapacitor.BridgeActivity { *; }

# Preserve line numbers for crash reporting
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
