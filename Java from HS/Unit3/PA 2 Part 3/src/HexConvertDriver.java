import javax.swing.JOptionPane;

public class HexConvertDriver
{

	public static void main(String[] args) 
	{
		//variables
		int baseIn;
		int numIn;
		int range;
	
		
		//Input New Base
		baseIn = Integer.parseInt(JOptionPane.showInputDialog("Enter the new base you wish to convert to (2-9 or 16): "));
		
		//finding the range
		range = hexnumber.maxNumber(baseIn);
		
		JOptionPane.showMessageDialog(null, "The maximum number you can input is " + range);
		
		
		//input base10 number
		numIn = Integer.parseInt(JOptionPane.showInputDialog("Enter number you wish to conert (between 0-"+range+":" ));
		
		//convert selected base10 number into baseIn
		hexnumber conversion1 = new hexnumber(numIn, baseIn);
		
		JOptionPane.showMessageDialog(null, conversion1.toString());
	}

}
