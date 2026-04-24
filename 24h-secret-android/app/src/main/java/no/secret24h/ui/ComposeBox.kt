package no.secret24h.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import no.secret24h.data.MOOD_EMOJIS
import no.secret24h.data.MOODS

@Composable
fun ComposeBox(
    isSending: Boolean,
    onSubmit: (text: String, mood: String) -> Unit,
) {
    var text by remember { mutableStateOf("") }
    var mood by remember { mutableStateOf("annet") }
    val remaining = 280 - text.length
    val canSubmit = text.trim().length >= 5 && !isSending

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(Zinc900, RoundedCornerShape(16.dp))
            .border(1.dp, Zinc700, RoundedCornerShape(16.dp))
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        BasicTextField(
            value = text,
            onValueChange = { if (it.length <= 280) text = it },
            modifier = Modifier
                .fillMaxWidth()
                .defaultMinSize(minHeight = 72.dp),
            textStyle = TextStyle(color = Color(0xFFFAFAFA), fontSize = 15.sp, lineHeight = 22.sp),
            cursorBrush = SolidColor(VioletLight),
            decorationBox = { inner ->
                Box {
                    if (text.isEmpty()) {
                        Text(
                            "Del en hemmelighet anonymt... 🤫",
                            color = Zinc600,
                            fontSize = 15.sp,
                        )
                    }
                    inner()
                }
            },
        )

        // Mood chips
        Row(horizontalArrangement = Arrangement.spacedBy(6.dp), modifier = Modifier.fillMaxWidth()) {
            MOODS.forEach { m ->
                val selected = m == mood
                Surface(
                    onClick = { mood = m },
                    shape = RoundedCornerShape(50),
                    color = if (selected) VioletLight else Zinc800,
                ) {
                    Text(
                        text = "${MOOD_EMOJIS[m]} $m",
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                        fontSize = 12.sp,
                        color = if (selected) Color.White else Color(0xFFA1A1AA),
                    )
                }
            }
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                "$remaining",
                fontSize = 12.sp,
                color = if (remaining < 20) Color(0xFFF87171) else Zinc600,
            )

            Button(
                onClick = {
                    if (canSubmit) {
                        onSubmit(text.trim(), mood)
                        text = ""
                    }
                },
                enabled = canSubmit,
                colors = ButtonDefaults.buttonColors(containerColor = VioletLight),
                shape = RoundedCornerShape(12.dp),
            ) {
                Text(if (isSending) "Sender..." else "Del hemmelighet", fontSize = 13.sp)
            }
        }
    }
}
