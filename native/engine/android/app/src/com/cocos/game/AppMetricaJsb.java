package com.cocos.game;
import com.cocos.lib.JsbBridgeWrapper;
import com.cocos.lib.CocosActivity;
import android.os.Bundle;
import android.content.Context;
import io.appmetrica.analytics.AppMetrica;
import io.appmetrica.analytics.AppMetricaConfig;

public class AppMetricaJsb {

    public void start(CocosActivity activity) {
        // Creating an extended library configuration.
        AppMetricaConfig config = AppMetricaConfig.newConfigBuilder("143de702-7cc9-4e58-a63c-59a915e6caa6").build();

        // Initializing the AppMetrica SDK.
        AppMetrica.activate(activity, config);

        // Automatic tracking user activity.
        AppMetrica.enableActivityAutoTracking(activity.getApplication());

        JsbBridgeWrapper jbw = JsbBridgeWrapper.getInstance();
        jbw.addScriptEventListener("requestAppMetricaLevelStartCall", arg ->{
            String eventParameters = "{\"" + arg + "\": \"\"}";
            AppMetrica.reportEvent("startedLevels", eventParameters);
        });

        jbw.addScriptEventListener("requestAppMetricaLevelFinishWinCall", arg ->{
            String eventParameters = "{\"" + arg + "\": \"\"}";
            AppMetrica.reportEvent("finishedLevels", eventParameters);
        });
    
        jbw.addScriptEventListener("requestAppMetricaLevelFinishLoseCall", arg ->{
            String eventParameters = "{\"" + arg + "\": \"\"}";
            AppMetrica.reportEvent("losedLevels", eventParameters);
        });
    }
}