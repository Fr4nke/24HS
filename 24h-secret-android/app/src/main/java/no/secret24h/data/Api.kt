package no.secret24h.data

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.time.Instant

object Api {
    private val client = OkHttpClient()
    private val json = "application/json".toMediaType()

    private fun baseRequest(path: String): Request.Builder =
        Request.Builder()
            .url("${Config.SUPABASE_URL}$path")
            .header("apikey", Config.SUPABASE_ANON_KEY)
            .header("Authorization", "Bearer ${Config.SUPABASE_ANON_KEY}")
            .header("Content-Type", "application/json")

    private fun JSONObject.toSecret() = Secret(
        id = getString("id"),
        text = getString("text"),
        mood = optString("mood", "annet"),
        expiresAt = getString("expires_at"),
        reactionMeToo = optInt("reaction_me_too", 0),
        reactionHeart = optInt("reaction_heart", 0),
    )

    suspend fun getSecrets(sort: Sort): List<Secret> = withContext(Dispatchers.IO) {
        val order = if (sort == Sort.Top) "reaction_me_too.desc" else "created_at.desc"
        val now = Instant.now().toString()
        val req = baseRequest(
            "/rest/v1/secrets?select=id,text,mood,expires_at,reaction_me_too,reaction_heart" +
            "&expires_at=gt.$now&order=$order&limit=50"
        ).get().build()

        client.newCall(req).execute().use { res ->
            if (!res.isSuccessful) throw Exception("Feil: ${res.code}")
            val body = res.body!!.string()
            val arr = JSONArray(body)
            List(arr.length()) { arr.getJSONObject(it).toSecret() }
        }
    }

    suspend fun postSecret(text: String, mood: String): Secret = withContext(Dispatchers.IO) {
        val body = JSONObject().put("text", text).put("mood", mood).toString()
            .toRequestBody(json)
        val req = baseRequest("/rest/v1/secrets")
            .header("Prefer", "return=representation")
            .post(body)
            .build()

        client.newCall(req).execute().use { res ->
            if (!res.isSuccessful) throw Exception("Kunne ikke lagre: ${res.code}")
            JSONArray(res.body!!.string()).getJSONObject(0).toSecret()
        }
    }

    suspend fun react(secretId: String, colName: String) = withContext(Dispatchers.IO) {
        val body = JSONObject()
            .put("secret_id", secretId)
            .put("col_name", colName)
            .toString()
            .toRequestBody(json)
        val req = baseRequest("/rest/v1/rpc/increment_reaction").post(body).build()
        client.newCall(req).execute().use { res ->
            if (!res.isSuccessful) throw Exception("Reaksjon feilet: ${res.code}")
        }
    }
}
