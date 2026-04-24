package no.secret24h.data

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class UiState(
    val secrets: List<Secret> = emptyList(),
    val sort: Sort = Sort.Recent,
    val isLoading: Boolean = false,
    val error: String? = null,
)

class SecretsViewModel : ViewModel() {
    private val _state = MutableStateFlow(UiState())
    val state = _state.asStateFlow()

    init { load() }

    fun setSort(sort: Sort) {
        _state.value = _state.value.copy(sort = sort)
        load()
    }

    fun load() {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true, error = null)
            try {
                val secrets = Api.getSecrets(_state.value.sort)
                _state.value = _state.value.copy(secrets = secrets, isLoading = false)
            } catch (e: Exception) {
                _state.value = _state.value.copy(isLoading = false, error = e.message)
            }
        }
    }

    fun postSecret(text: String, mood: String, onDone: () -> Unit) {
        viewModelScope.launch {
            try {
                val secret = Api.postSecret(text, mood)
                if (_state.value.sort == Sort.Recent) {
                    _state.value = _state.value.copy(
                        secrets = listOf(secret) + _state.value.secrets
                    )
                }
                onDone()
            } catch (e: Exception) {
                _state.value = _state.value.copy(error = e.message)
            }
        }
    }

    fun react(secretId: String, type: String) {
        val col = if (type == "me_too") "reaction_me_too" else "reaction_heart"
        _state.value = _state.value.copy(
            secrets = _state.value.secrets.map { s ->
                if (s.id != secretId) s
                else if (type == "me_too") s.copy(reactionMeToo = s.reactionMeToo + 1)
                else s.copy(reactionHeart = s.reactionHeart + 1)
            }
        )
        viewModelScope.launch {
            try { Api.react(secretId, col) } catch (_: Exception) {}
        }
    }
}
