import java.util.Scanner;
public class ConvertFahrenheit {

	public static void main(String[] args) 
	{
		double fahr;
		
		
		Scanner scan = new Scanner(System.in);
		//prompt user for input
		System.out.print("Enter degress in Fahr: ");
		fahr = scan.nextDouble();
		
		System.out.print(fahr+" Degrees in Fahrenheit is " +(fahr-32.0)*5.0/9.0+ " Degrees Celsius.");

	}

}
