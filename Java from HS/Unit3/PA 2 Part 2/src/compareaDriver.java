//Jake Tantorski Bowen Brennan PA2 PArt 1
//import javax.swing.JOptionPane;
import java. util. Scanner;
import java.text.DecimalFormat;

public class compareaDriver {

	public static void main(String[] args) 
	{
		DecimalFormat fmt = new DecimalFormat("0.###");
		
		int input;
		double squareside;
		double base,height;
		double length,width;
		double radius;
		double tribase,triheight;
		//This is the Menu
		System.out.println("CODE          FUNCTION");
		System.out.println(" 1         Compute Area of a Square");
		System.out.println(" 2         Compute Area of a Rectangle");
		System.out.println(" 3         Compute Area of a Parallelogram");
		System.out.println(" 4         Compute Area of a Circle");
		System.out.println(" 5         Compute Area of a Triangle");
		System.out.println(" 6         Exit Program");
		System.out.println(" ");
		System.out.print("Choose a Function: ");
		Scanner scan = new Scanner(System.in);
		input = scan.nextInt();
		//Asking for Square
		if(input == 1)
		{
			System.out.print("Enter in a side: ");
			squareside = scan.nextDouble();
			System.out.print("The Area of a Square with the side of " + squareside + " is: " + fmt.format(comparea.squareArea(squareside)));
			
			
		}
		//Asking for Rectangle
		if(input == 2)
		{
			System.out.print("Enter in the base: ");
			length = scan.nextDouble();
			System.out.print("Enter in the height: ");
			width = scan.nextDouble();
			System.out.print("The Area of a Rectangle with the length of " + length + " and width of " + width + " is: " + fmt.format(recarea.rectangleArea(width,length)));
			
			
		}
		//Asking for Parallelogram
		if(input == 3)
		{
			System.out.print("Enter in the base: ");
			base = scan.nextDouble();
			System.out.print("Enter in the height: ");
			height = scan.nextDouble();
			System.out.print("The Area of a Parallelogram with the base of " + base + " and height of " + height + " is: " + fmt.format(paraarea.parallelogramArea(base,height)));
			
			
		}
		//Asking for Circle
		if(input == 4)
		{
			System.out.print("Enter in the radius: ");
			radius = scan.nextDouble();
			
			System.out.print("The Area of a Circle with the radius of " + radius + " is: " + fmt.format(circarea.circleArea(radius)));
			
			
		}
		//Asking for Triangle
		if(input == 5)
		{
			System.out.print("Enter in the base: ");
			tribase = scan.nextDouble();
			System.out.print("Enter in the height: ");
			triheight = scan.nextDouble();
			System.out.print("The Area of a Triangle with the base of " + tribase + " and height of " + triheight + " is: " + fmt.format(triarea.triangleArea(tribase,triheight)));
			
			
		}
		//End Program
		if(input == 6)
		{
			System.out.print("Thank you!");
			
			
		}
	}

}
