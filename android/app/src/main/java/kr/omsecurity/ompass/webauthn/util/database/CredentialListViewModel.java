package kr.omsecurity.ompass.webauthn.util.database;

import android.app.Application;
import android.os.AsyncTask;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;
import kr.omsecurity.ompass.webauthn.models.PublicKeyCredentialSource;

import java.util.List;

public class CredentialListViewModel extends AndroidViewModel {
    private final LiveData<List<PublicKeyCredentialSource>> credentialList;
    private CredentialDatabase credentialDatabase;

    public CredentialListViewModel(Application application) {
        super(application);
        credentialDatabase = CredentialDatabase.getDatabase(this.getApplication());
        credentialList = credentialDatabase.credentialDao().getAllLive();
    }

    public LiveData<List<PublicKeyCredentialSource>> getCredentialList() {
        return credentialList;
    }

    public void deleteItem(PublicKeyCredentialSource credential) {
        new deleteAsyncTask(credentialDatabase).execute(credential);
    }

    private static class deleteAsyncTask extends AsyncTask<PublicKeyCredentialSource, Void, Void> {
        private CredentialDatabase db;

        deleteAsyncTask(CredentialDatabase credentialDatabase) {
            db = credentialDatabase;
        }

        @Override
        protected Void doInBackground(final PublicKeyCredentialSource... params) {
            db.credentialDao().delete(params[0]);
            return null;
        }
    }
}
