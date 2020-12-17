import java.util.Scanner;

public class MPG {

	public static void main(String[] args) {
		 
			Scanner scan = new Scanner(System.in);
		 
				System.out.print("How many miles were on the odometer at the beginning:");
 
				double milesstart;
 
                 milesstart = scan.nextDouble();
                 
                 System.out.print("How many miles were on the odometer at the end: ");
        		 
                 double milesend;
 
                 milesend = scan.nextDouble();
                 
                 double milestotal;
 
                 milestotal =milesend - milesstart;
 
                 System.out.print("How many gallons were used:");
 
                 double gallons;
 
                 gallons = scan.nextDouble();
 
  
 
                 double mpg;
 
                 mpg = milestotal / gallons;
 
  
 
                 System.out.println("The Miles-Per-Gallon used in this trip are: " + mpg + "!");

	}

}
