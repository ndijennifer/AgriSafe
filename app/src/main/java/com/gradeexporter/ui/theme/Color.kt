package com.gradeexporter.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext

private val Primary = Color(0xFF115E59)
private val OnPrimary = Color.White
private val PrimaryContainer = Color(0xFF99F6E4)
private val OnPrimaryContainer = Color(0xFF0F766E)

private val Secondary = Color(0xFF8B5CF6)
private val OnSecondary = Color.White
private val SecondaryContainer = Color(0xFFEDE9FE)
private val OnSecondaryContainer = Color(0xFF5B21B6)

private val Tertiary = Color(0xFF22C55E)
private val OnTertiary = Color.White
private val TertiaryContainer = Color(0xFFD1FAE5)
private val OnTertiaryContainer = Color(0xFF166534)

private val Background = Color(0xFFF8FAFC)
private val OnBackground = Color(0xFF0F172A)
private val Surface = Color(0xFFFFFFFF)
private val OnSurface = Color(0xFF0F172A)
private val SurfaceVariant = Color(0xFFEEF2FF)
private val OnSurfaceVariant = Color(0xFF334155)

private val Error = Color(0xFFEF4444)
private val OnError = Color.White

val Navy = Color(0xFF111827)
val NavyLight = Color(0xFF475569)
val MidGray = Color(0xFF64748B)
val Border = Color(0xFFCBD5E1)
val OffWhite = Color(0xFFF8FAFC)
val LightGray = Color(0xFFE2E8F0)
val NavyMid = Color(0xFF1F2937)

object Colors {
    val primary = Primary
    val secondary = Secondary
    val success = Tertiary
    val warning = Color(0xFFF59E0B)
    val navy = Navy
    val navyLight = NavyLight
    val navyMid = NavyMid
    val midGray = MidGray
    val border = Border
    val offWhite = OffWhite
    val lightGray = LightGray
    val background = Background
    val card = Surface
    val white = Color.White
    val blue = Secondary
}

private val LightColorScheme = lightColorScheme(
    primary = Primary,
    onPrimary = OnPrimary,
    primaryContainer = PrimaryContainer,
    onPrimaryContainer = OnPrimaryContainer,
    secondary = Secondary,
    onSecondary = OnSecondary,
    secondaryContainer = SecondaryContainer,
    onSecondaryContainer = OnSecondaryContainer,
    tertiary = Tertiary,
    onTertiary = OnTertiary,
    tertiaryContainer = TertiaryContainer,
    onTertiaryContainer = OnTertiaryContainer,
    error = Error,
    onError = OnError,
    background = Background,
    onBackground = OnBackground,
    surface = Surface,
    onSurface = OnSurface,
    surfaceVariant = SurfaceVariant,
    onSurfaceVariant = OnSurfaceVariant,
    outline = Border
)

@Composable
fun GradeExporterTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = true,
    content: @Composable () -> Unit
) {
    val context = LocalContext.current
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> darkColorScheme()
        else -> LightColorScheme
    }
    
    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}
