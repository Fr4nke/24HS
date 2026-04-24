package no.secret24h.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import no.secret24h.data.MOOD_EMOJIS
import no.secret24h.data.Secret
import java.time.Instant
import java.time.OffsetDateTime
import java.time.temporal.ChronoUnit

val MOOD_COLORS = mapOf(
    "lettelse" to (Color(0xFF1E3A5F) to Color(0xFF93C5FD)),
    "skam" to (Color(0xFF4C1D1D) to Color(0xFFFCA5A5)),
    "stolthet" to (Color(0xFF3D2A00) to Color(0xFFFCD34D)),
    "anger" to (Color(0xFF431407) to Color(0xFFFDBA74)),
    "annet" to (Zinc800 to Color(0xFFA1A1AA)),
)

@Composable
fun Countdown(expiresAt: String) {
    var timeLeft by remember { mutableStateOf("") }

    LaunchedEffect(expiresAt) {
        while (true) {
            try {
                val expiry = OffsetDateTime.parse(expiresAt).toInstant()
                val diff = ChronoUnit.SECONDS.between(Instant.now(), expiry)
                timeLeft = if (diff <= 0) "Utløpt" else {
                    val h = diff / 3600
                    val m = (diff % 3600) / 60
                    val s = diff % 60
                    "${h}t ${m}m ${s}s"
                }
            } catch (_: Exception) {
                timeLeft = "?"
            }
            delay(1000)
        }
    }

    Text("⏳ $timeLeft", fontSize = 11.sp, color = Zinc600)
}

@Composable
fun SecretCard(
    secret: Secret,
    rank: Int? = null,
    reactedMeToo: Boolean,
    reactedHeart: Boolean,
    onReact: (String) -> Unit,
) {
    val rankColors = mapOf(1 to Color(0xFFEAB308), 2 to Color(0xFF9CA3AF), 3 to Color(0xFFB45309))

    Box(modifier = Modifier.fillMaxWidth()) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = if (rank != null) 8.dp else 0.dp),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Zinc900),
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text(
                    text = secret.text,
                    color = Color(0xFFFAFAFA),
                    fontSize = 15.sp,
                    lineHeight = 22.sp,
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalAlignment = Alignment.CenterVertically) {
                        val (bg, fg) = MOOD_COLORS[secret.mood] ?: (Zinc800 to Color(0xFFA1A1AA))
                        val emoji = MOOD_EMOJIS[secret.mood] ?: "💭"
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(50))
                                .background(bg)
                                .padding(horizontal = 8.dp, vertical = 2.dp)
                        ) {
                            Text("$emoji ${secret.mood}", fontSize = 11.sp, color = fg)
                        }
                        Countdown(secret.expiresAt)
                    }

                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        ReactionButton(
                            emoji = "🙋",
                            label = "meg også",
                            count = secret.reactionMeToo,
                            active = reactedMeToo,
                            activeColor = Color(0xFF4C1D95),
                        ) { onReact("me_too") }

                        ReactionButton(
                            emoji = "❤️",
                            label = "",
                            count = secret.reactionHeart,
                            active = reactedHeart,
                            activeColor = Color(0xFF500724),
                        ) { onReact("heart") }
                    }
                }
            }
        }

        if (rank != null) {
            val badgeColor = rankColors[rank] ?: Color.Gray
            Box(
                modifier = Modifier
                    .offset(x = 8.dp, y = 0.dp)
                    .size(28.dp)
                    .clip(CircleShape)
                    .background(badgeColor),
                contentAlignment = Alignment.Center,
            ) {
                Text("#$rank", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color.Black)
            }
        }
    }
}

@Composable
fun ReactionButton(
    emoji: String,
    label: String,
    count: Int,
    active: Boolean,
    activeColor: Color,
    onClick: () -> Unit,
) {
    val bg = if (active) activeColor else Zinc800
    val fg = if (active) Color.White else Color(0xFFA1A1AA)

    Surface(
        onClick = onClick,
        enabled = !active,
        shape = RoundedCornerShape(12.dp),
        color = bg,
        modifier = Modifier.height(32.dp),
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 10.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(4.dp),
        ) {
            Text(emoji, fontSize = 13.sp)
            Text("$count", fontSize = 13.sp, fontWeight = FontWeight.Medium, color = fg)
            if (label.isNotEmpty()) Text(label, fontSize = 11.sp, color = fg)
        }
    }
}
