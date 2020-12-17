import java.util.Scanner;

public class TimeToSeconds {

	public static void main(String[] args) {
		int hours, min,sec;
		
		Scanner scan = new Scanner(System.in);
		
		System.out.print("Enter number of hours : ");
		
		hours = scan.nextInt();
		
		System.out.print("Enter number of minutes : ");
		
		min = scan.nextInt();
		
		System.out.print("Enter number of seconds: ");
		
		sec = scan.nextInt();
		
		System.out.print(hours + " hour(s), " + min + " minute(s), and " + sec + " second(s) is equal to: " +secConv( hours, min, sec)+ " seconds!");
 
	}
	public static double secConv(int hours, int min, int sec)
	{
		return((hours*3600)+ (min*60)+sec);
	}
	

}






