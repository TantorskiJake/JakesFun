import javax.swing.JOptionPane;

public class WhenIsEaster {

	public static void main(String[] args) 
	{
		int calcYear;
		
		Easter easter = new Easter();
		
		String year = JOptionPane.showInputDialog("Enter a year: ");
		
		calcYear = Integer.parseInt (year); 
		
		JOptionPane.showMessageDialog (null, easter.calculateEaster(calcYear)); 

	}

}
