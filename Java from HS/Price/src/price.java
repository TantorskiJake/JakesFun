import java.util.Scanner;
import java.text.DecimalFormat;
import javax.swing.JOptionPane;

public class price {

	public static void main(String[] args) {
		
		Scanner scan = new Scanner(System.in);
		DecimalFormat fmt = new DecimalFormat("0.##");
		
		
		double price, taxPrice,cash;
		String itemprice;
		
		
		itemprice = JOptionPane.showInputDialog("Enter a price of an item: ");
		
		
		//System.out.print("Enter a price of an item: ");
		//price = scan.nextDouble();
		
		taxPrice = Double.parseDouble(price)*1.0635;
		//System.out.println("Your item is: " + fmt.format(taxPrice));
		
		//System.out.print("Enter amount of money used (in dollars): ");
		//cash = scan.nextDouble();
		
		//System.out.print("Your change is: " + fmt.format(cash-taxPrice));
		
	}

}
