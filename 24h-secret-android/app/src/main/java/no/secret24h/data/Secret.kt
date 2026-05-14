package no.secret24h.data

data class Secret(
    val id: String,
    val text: String,
    val mood: String,
    val expiresAt: String,
    val reactionMeToo: Int,
    val reactionWild: Int,
    val reactionDoubtful: Int,
    val userId: String? = null,
)

enum class Sort { Recent, Top }

val MOODS = listOf("relief", "shame", "pride", "regret", "longing", "anger", "fear", "joy", "other")

val MOOD_EMOJIS = mapOf(
    "relief"  to "😮‍💨",
    "shame"   to "😳",
    "pride"   to "💪",
    "regret"  to "😔",
    "longing" to "🌙",
    "anger"   to "😤",
    "fear"    to "😨",
    "joy"     to "✨",
    "other"   to "💭",
)
