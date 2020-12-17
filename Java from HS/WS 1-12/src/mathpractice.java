import java.util.Scanner;

//Jake Tantorski 9/22/16
public class mathpractice {

	public static void main(String[] args) {
		int hours, min, sec, totalsec;
		
		
		Scanner scan = new Scanner(System.in);
		
		System.out.print("Enter number of seconds : ");
		
		totalsec = scan.nextInt();
		
		hours = totalsec/3600;
		min = (totalsec-hours*3600)/60;
		sec= (totalsec%60);
		
		
		System.out.print(totalsec + " is eqaul to: " + hours + " hours, " + min + " minutes and  " + sec + " seconds.");

	}
	
}
