package no.secret24h.ui

import android.graphics.BlurMaskFilter
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Paint
import androidx.compose.ui.graphics.drawscope.drawIntoCanvas
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

// ── Smolder palette ───────────────────────────────────────────────────────────
val SmBg          = Color(0xFF120608)
val SmSurface     = Color(0x0AFFC8B4)   // rgba(255,200,180,0.04)
val SmBorder      = Color(0x1AFF8C6E)   // rgba(255,140,110,0.10)
val SmText        = Color(0xFFFFE8DC)
val SmTextDim     = Color(0x8CFFE8DC)   // 55% opacity
val SmTextFaint   = Color(0x4DFFE8DC)   // 30% opacity
val SmAccent      = Color(0xFFFF7A4D)
val SmAccentGlow  = Color(0x99FF7A4D)   // 60% opacity
val SmAccentDeep  = Color(0xFFC83018)

// Legacy aliases used in other files
val VioletLight   = SmAccent
val Zinc600       = SmTextDim
val Zinc700       = Color(0xFF3A1A10)
val Zinc800       = Color(0xFF1E0C09)
val Zinc900       = Color(0xFF160806)
val DuskBg        = SmBg
val DuskBorder    = SmBorder
val DuskAccent    = SmAccent
val DuskGlow      = SmAccentGlow
val DuskText      = SmText
val DuskMuted     = SmTextDim
val DuskCardBg    = SmSurface

// ── Emotion colors (oklch(72% 0.2 <hue>) approximated) ───────────────────────
data class EmotionColors(val bg: Color, val fg: Color, val glow: Color)

val EMOTION_COLORS = mapOf(
    "relief"  to EmotionColors(Color(0xFF0D1A3A), Color(0xFF7B77FF), Color(0xFF5A55EE)),
    "shame"   to EmotionColors(Color(0xFF3A1008), Color(0xFFFF7A5A), Color(0xFFEE5533)),
    "pride"   to EmotionColors(Color(0xFF3A2800), Color(0xFFFFAD45), Color(0xFFEE9400)),
    "regret"  to EmotionColors(Color(0xFF0A1E30), Color(0xFF4AADFF), Color(0xFF2288EE)),
    "longing" to EmotionColors(Color(0xFF1E0A3A), Color(0xFFAB7BFF), Color(0xFF8855EE)),
    "anger"   to EmotionColors(Color(0xFF3A0808), Color(0xFFFF5F5F), Color(0xFFEE3333)),
    "fear"    to EmotionColors(Color(0xFF003A30), Color(0xFF42F0D4), Color(0xFF00CCAA)),
    "joy"     to EmotionColors(Color(0xFF3A0030), Color(0xFFFF6ADB), Color(0xFFEE3DC0)),
    "other"   to EmotionColors(Color(0xFF1A1210), Color(0xFF9E8880), Color(0xFF6E5850)),
)

// ── Fonts ─────────────────────────────────────────────────────────────────────
val InstrumentSerif = FontFamily.Serif
val GeistFamily     = FontFamily.Default

// ── Color scheme ──────────────────────────────────────────────────────────────
private val colorScheme = darkColorScheme(
    background       = SmBg,
    surface          = Zinc900,
    surfaceVariant   = Zinc800,
    primary          = SmAccent,
    onPrimary        = Color.White,
    onBackground     = SmText,
    onSurface        = SmText,
    onSurfaceVariant = SmTextDim,
    error            = Color(0xFFFF5F5F),
)

private val typography = Typography(
    bodyLarge  = TextStyle(fontFamily = FontFamily.Default, fontSize = 15.sp, lineHeight = 22.sp),
    bodyMedium = TextStyle(fontFamily = FontFamily.Default, fontSize = 13.sp),
    labelSmall = TextStyle(fontFamily = FontFamily.Default, fontSize = 11.sp),
)

@Composable
fun AppTheme(content: @Composable () -> Unit) {
    MaterialTheme(colorScheme = colorScheme, typography = typography, content = content)
}

// ── Glow modifier ─────────────────────────────────────────────────────────────
fun androidx.compose.ui.Modifier.glowBehind(
    color: Color,
    radius: Dp = 20.dp,
    cornerRadius: Dp = 16.dp,
    alpha: Float = 0.35f,
) = drawBehind {
    drawIntoCanvas { canvas ->
        val paint = Paint()
        val fp = paint.asFrameworkPaint()
        fp.maskFilter = BlurMaskFilter(radius.toPx(), BlurMaskFilter.Blur.NORMAL)
        fp.color = color.copy(alpha = alpha).toArgb()
        canvas.drawRoundRect(0f, 0f, size.width, size.height, cornerRadius.toPx(), cornerRadius.toPx(), paint)
    }
}
