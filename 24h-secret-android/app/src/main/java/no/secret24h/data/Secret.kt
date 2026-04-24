package no.secret24h.data

data class Secret(
    val id: String,
    val text: String,
    val mood: String,
    val expiresAt: String,
    val reactionMeToo: Int,
    val reactionHeart: Int,
)

enum class Sort { Recent, Top }

val MOODS = listOf("lettelse", "skam", "stolthet", "anger", "annet")

val MOOD_EMOJIS = mapOf(
    "lettelse" to "😮‍💨",
    "skam" to "😳",
    "stolthet" to "💪",
    "anger" to "😤",
    "annet" to "💭",
)
