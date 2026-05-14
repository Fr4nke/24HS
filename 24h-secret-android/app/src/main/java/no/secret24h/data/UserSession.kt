package no.secret24h.data

import android.content.Context
import android.content.SharedPreferences

object UserSession {
    private const val PREFS = "user_session"
    private const val KEY_TOKEN = "access_token"
    private const val KEY_USER_ID = "user_id"
    private const val KEY_EMAIL = "email"

    var accessToken: String? = null
        private set
    var userId: String? = null
        private set
    var email: String? = null
        private set

    val isLoggedIn get() = accessToken != null

    private var prefs: SharedPreferences? = null

    fun init(context: Context) {
        val p = context.applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        prefs = p
        accessToken = p.getString(KEY_TOKEN, null)
        userId = p.getString(KEY_USER_ID, null)
        email = p.getString(KEY_EMAIL, null)
    }

    fun save(token: String, uid: String, mail: String) {
        accessToken = token
        userId = uid
        email = mail
        prefs?.edit()
            ?.putString(KEY_TOKEN, token)
            ?.putString(KEY_USER_ID, uid)
            ?.putString(KEY_EMAIL, mail)
            ?.apply()
    }

    fun clear() {
        accessToken = null
        userId = null
        email = null
        prefs?.edit()?.clear()?.apply()
    }
}
