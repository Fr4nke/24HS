package no.secret24h.data

import android.annotation.SuppressLint
import android.content.Context
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlin.coroutines.resume

data class LatLng(val lat: Double, val lng: Double)

object LocationHelper {
    @SuppressLint("MissingPermission")
    suspend fun getLocation(context: Context): LatLng? = try {
        val client = LocationServices.getFusedLocationProviderClient(context)
        suspendCancellableCoroutine { cont ->
            client.getCurrentLocation(Priority.PRIORITY_BALANCED_POWER_ACCURACY, null)
                .addOnSuccessListener { loc -> cont.resume(loc?.let { LatLng(it.latitude, it.longitude) }) }
                .addOnFailureListener { cont.resume(null) }
        }
    } catch (_: Exception) { null }
}
