import java.util.Scanner;

public class middle3 {

	public static void main(String[] args) {
		Scanner scan = new Scanner(System.in);
		String whole ;
		
		
		System.out.print("Enter your string: ");
		whole = scan.nextLine();
		
		
		System.out.println(whole.length());
		
		System.out.println(whole.substring((whole.length()/2)-1,4));
	
	}

}
