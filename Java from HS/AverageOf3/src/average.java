

	import java.util.Scanner;
	import java.text.DecimalFormat;
	import javax.swing.JOptionPane;

	public class average {

		public static void main(String[] args) {
			
			Scanner scan = new Scanner(System.in);
			DecimalFormat fmt = new DecimalFormat("0.###");
			
			
			
			String num1, num2,num3,average;
			double number1, number2, number3,perm, finale;
			
			num1 = JOptionPane.showInputDialog("Enter first side: ");
			num2 = JOptionPane.showInputDialog("Enter second side: ");
			num3 = JOptionPane.showInputDialog("Enter third side: ");
			
			number1 = Double.parseDouble ( num1); 
			number2 = Double.parseDouble ( num2); 
			number3 = Double.parseDouble ( num3); 

			perm =.5*(number1+number2+number3);
			
			finale = Math.sqrt((perm)*(perm-number1)*(perm-number2)*(perm-number3));
			
			JOptionPane.showMessageDialog (null, "The perimeter is: "+perm); 
			JOptionPane.showMessageDialog (null, "The area is: "+fmt.format(finale)); 
}

		
	}
