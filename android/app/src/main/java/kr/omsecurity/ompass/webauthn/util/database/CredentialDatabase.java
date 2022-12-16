package kr.omsecurity.ompass.webauthn.util.database;

import android.content.Context;
import androidx.room.Database;
import androidx.room.Room;
import androidx.room.RoomDatabase;
import kr.omsecurity.ompass.webauthn.models.PublicKeyCredentialSource;

@Database(entities = {PublicKeyCredentialSource.class}, version = 3, exportSchema = false)
public abstract class CredentialDatabase extends RoomDatabase {
    private static CredentialDatabase INSTANCE;
    private static final String CREDENTIAL_DB_NAME = "credentialmetadata";

    public static CredentialDatabase getDatabase(Context ctx) {
        if (INSTANCE == null) {
            INSTANCE = Room.databaseBuilder(ctx.getApplicationContext(), CredentialDatabase.class, CREDENTIAL_DB_NAME)
                    .allowMainThreadQueries()
                    .build();
        }
        return INSTANCE;
    }

    public abstract CredentialDao credentialDao();
}
