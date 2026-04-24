package no.secret24h.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import no.secret24h.data.Secret
import no.secret24h.data.SecretsViewModel
import no.secret24h.data.Sort

@Composable
fun MainScreen(vm: SecretsViewModel = viewModel()) {
    val state by vm.state.collectAsStateWithLifecycle()
    var isSending by remember { mutableStateOf(false) }
    val reactedIds = remember { mutableStateMapOf<String, Set<String>>() }

    AppTheme {
        Surface(
            modifier = Modifier.fillMaxSize(),
            color = Color(0xFF09090B),
        ) {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 24.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp),
            ) {
                // Header
                item {
                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(4.dp),
                    ) {
                        Text(
                            buildAnnotatedString {
                                append("🤫 ")
                                withStyle(SpanStyle(color = Color(0xFFA78BFA), fontWeight = FontWeight.Bold)) {
                                    append("24h Secret")
                                }
                            },
                            fontSize = 26.sp,
                            fontWeight = FontWeight.Bold,
                        )
                        Text(
                            "Anonym. Ingen konto. Forsvinner etter 24 timer.",
                            fontSize = 12.sp,
                            color = Zinc600,
                        )
                    }
                }

                // Compose box
                item {
                    ComposeBox(isSending = isSending) { text, mood ->
                        isSending = true
                        vm.postSecret(text, mood) { isSending = false }
                    }
                }

                // Sort toggle
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                            SortTab("Siste", state.sort == Sort.Recent) { vm.setSort(Sort.Recent) }
                            SortTab("Topp 24t ✦", state.sort == Sort.Top) { vm.setSort(Sort.Top) }
                        }
                        if (state.sort == Sort.Top) {
                            Text("Mest resonert de siste 24t", fontSize = 11.sp, color = Zinc600)
                        }
                    }
                }

                // Error
                state.error?.let { err ->
                    item {
                        Text(err, color = Color(0xFFF87171), fontSize = 13.sp)
                    }
                }

                // Loading
                if (state.isLoading) {
                    item {
                        Box(Modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) {
                            CircularProgressIndicator(color = VioletLight, modifier = Modifier.size(28.dp))
                        }
                    }
                }

                // Empty state
                if (!state.isLoading && state.secrets.isEmpty()) {
                    item {
                        Column(
                            modifier = Modifier.fillMaxWidth().padding(vertical = 48.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(8.dp),
                        ) {
                            Text("🤫", fontSize = 40.sp)
                            Text("Ingen hemmeligheter ennå. Del den første!", color = Zinc600, fontSize = 14.sp)
                        }
                    }
                }

                // Feed
                items(state.secrets, key = { it.id }) { secret ->
                    val reacted = reactedIds[secret.id] ?: emptySet()
                    val idx = state.secrets.indexOf(secret)
                    SecretCard(
                        secret = secret,
                        rank = if (state.sort == Sort.Top && idx < 3) idx + 1 else null,
                        reactedMeToo = "me_too" in reacted,
                        reactedHeart = "heart" in reacted,
                        onReact = { type ->
                            if (type !in reacted) {
                                reactedIds[secret.id] = reacted + type
                                vm.react(secret.id, type)
                            }
                        },
                    )
                }
            }
        }
    }
}

@Composable
fun SortTab(label: String, selected: Boolean, onClick: () -> Unit) {
    Surface(
        onClick = onClick,
        shape = RoundedCornerShape(12.dp),
        color = if (selected) Zinc700 else Color.Transparent,
    ) {
        Text(
            label,
            modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp),
            fontSize = 13.sp,
            fontWeight = FontWeight.Medium,
            color = if (selected) Color.White else Zinc600,
        )
    }
}
