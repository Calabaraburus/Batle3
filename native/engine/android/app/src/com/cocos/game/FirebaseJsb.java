package com.cocos.game;
import com.cocos.lib.JsbBridgeWrapper;
import com.cocos.lib.CocosActivity;
import android.os.Bundle;
import android.content.Context;
import com.google.firebase.analytics.FirebaseAnalytics;

public class FirebaseJsb {

    private FirebaseAnalytics mFirebaseAnalytics;

    public void start(CocosActivity activity) {
        
        // Obtain the FirebaseAnalytics instance.
        mFirebaseAnalytics = FirebaseAnalytics.getInstance(activity);

        JsbBridgeWrapper jbw = JsbBridgeWrapper.getInstance();
        jbw.addScriptEventListener("requestFirebaseLevelStartCall", arg ->{
            Bundle params = new Bundle();
            params.putString("lvl_name", arg);
            mFirebaseAnalytics.logEvent("startedLevels", params);
        });

        jbw.addScriptEventListener("requestFirebaseLevelFinishWinCall", arg ->{
            Bundle params = new Bundle();
            params.putString("lvl_name", arg);
            mFirebaseAnalytics.logEvent("finishedLevels", params);
        });
    
        jbw.addScriptEventListener("requestFirebaseLevelFinishLoseCall", arg ->{
            Bundle params = new Bundle();
            params.putString("lvl_name", arg);
            mFirebaseAnalytics.logEvent("losedLevels", params);
        });
    }
}