package kr.omsecurity.ompass;

public class TimerThread implements Runnable{
    private boolean isTimeOver = false;

    public TimerThread() {

    }

    @Override
    public void run() {
        final long time = System.currentTimeMillis();
        while(System.currentTimeMillis() - time <= 5000) {
            if(System.currentTimeMillis() - time >= 5000) {
                isTimeOver = true;
            }
        }
    }

    public boolean getResult() {
        return isTimeOver;
    }
}
