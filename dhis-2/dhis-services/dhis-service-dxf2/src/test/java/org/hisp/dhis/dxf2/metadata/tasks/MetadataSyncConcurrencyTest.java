package org.hisp.dhis.dxf2.metadata.tasks;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.apache.commons.codec.binary.Base64;

/**
 * Created by aamerm on 03/10/16.
 */

class MetadataSyncTest implements Runnable
{
    public void run()
    {

        try
        {
            callSyncApi();
//            callCreateVersionApi();
        }
        catch ( Exception e )
        {
            e.printStackTrace();
        }
    }

    private void callSyncApi() throws Exception
    {
        String url = "http://localhost:8080/api/metadata/sync?versionName=Version_18";

        URL obj = new URL( url );
        HttpURLConnection con = (HttpURLConnection) obj.openConnection();

        con.setRequestMethod( "GET" );

        String username = "admin";
        String password = "district";
        String authString = username + ":" + password;
        byte[] authEncBytes = Base64.encodeBase64( authString.getBytes() );
        String authStringEnc = new String( authEncBytes );
        con.setRequestProperty( "Authorization", "Basic " + authStringEnc );

        int responseCode = con.getResponseCode();
        System.out.println( Thread.currentThread().getName() + ": Calling sync api: " + url );
        System.out.println( Thread.currentThread().getName() + ": Response Code: " + responseCode );

        BufferedReader in = new BufferedReader(
            new InputStreamReader( con.getInputStream() ) );
        String inputLine;
        StringBuffer response = new StringBuffer();

        while ( (inputLine = in.readLine()) != null )
        {
            response.append( inputLine );
        }
        in.close();

        System.out.println( Thread.currentThread().getName() + ": Response: " + response.toString() );
    }

    private void callCreateVersionApi() throws Exception
    {

        String url = "http://localhost:8080/api/metadata/version/create";
        URL obj = new URL( url );
        HttpURLConnection con = (HttpURLConnection) obj.openConnection();

        con.setRequestMethod( "POST" );

        String username = "admin";
        String password = "district";
        String authString = username + ":" + password;
        byte[] authEncBytes = Base64.encodeBase64( authString.getBytes() );
        String authStringEnc = new String( authEncBytes );
        con.setRequestProperty( "Authorization", "Basic " + authStringEnc );
        String urlParameters = "type=BEST_EFFORT";

        con.setDoOutput( true );
        DataOutputStream wr = new DataOutputStream( con.getOutputStream() );
        wr.writeBytes( urlParameters );
        wr.flush();
        wr.close();

        int responseCode = con.getResponseCode();
        System.out.println( Thread.currentThread().getName() + ": Calling create version api: " + url );
        System.out.println( Thread.currentThread().getName() + ": Response Code: " + responseCode );

        BufferedReader in = new BufferedReader(
            new InputStreamReader( con.getInputStream() ) );
        String inputLine;
        StringBuffer response = new StringBuffer();

        while ( (inputLine = in.readLine()) != null )
        {
            response.append( inputLine );
        }
        in.close();

        System.out.println( Thread.currentThread().getName() + ": Response: " + response.toString() );
    }
}

public class MetadataSyncConcurrencyTest
{
    private static final String[] SPRING_CONFIG_FILES = new String[]{ "META-INF/dhis/beans.xml" };

    public static void startThreads()
    {
        MetadataSyncTest metadataSyncTest = new MetadataSyncTest();
        Thread t1 = new Thread( metadataSyncTest, "Thread 1" );
        Thread t2 = new Thread( metadataSyncTest, "Thread 2" );
        Thread t3 = new Thread( metadataSyncTest, "Thread 3" );
        Thread t4 = new Thread( metadataSyncTest, "Thread 4" );
        Thread t5 = new Thread( metadataSyncTest, "Thread 5" );
        t1.start();
        t2.start();
        t3.start();
        t4.start();
        t5.start();
    }

    public static void startThreadsUsingExecutorService()
    {
        ExecutorService executor = Executors.newFixedThreadPool( 5 );//creating a pool of 5 threads
        for ( int i = 0; i < 10; i++ )
        {
            Runnable worker = new MetadataSyncTest();
            executor.execute( worker );//calling execute method of ExecutorService
        }
        executor.shutdown();
        while ( !executor.isTerminated() )
        {
        }

        System.out.println( "Finished all threads" );
    }

    public static void main( String[] args ) throws Exception
    {

//        ApplicationContext context = new ClassPathXmlApplicationContext("META-INF/dhis/beans.xml");
//        MetadataSyncTask syncTask = context.getBean(MetadataSyncTask.class);
//        System.out.println(context.getBean("retryPolicy"));
//        System.out.println(context.getBean("metadataSyncPreProcessor"));
//        System.out.println(context.getBean("backOffPolicy"));
//        MetadataSyncPreProcessor sp = (MetadataSyncPreProcessor)context.getBean("metadataSyncPreProcessor");
//        Thread t1 = new Thread(syncTask, "Thread 1");
//        t1.start();

//        MetadataSyncConcurrencyTest.startThreads();
        MetadataSyncConcurrencyTest.startThreadsUsingExecutorService();

    }


}
