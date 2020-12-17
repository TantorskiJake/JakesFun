import java.util.Scanner;
public class Student 
{

	public static void main(String[] args) 
	{
		
	}	
	public String isEligibleForHonors (int classYear , double gpa)
	{
		
		Scanner scan = new Scanner(System.in);
		System.out.println("Enter year (ex. Senior = 4): ");
		 classYear = scan.nextInt();
		 System.out.println("Enter GPA: ");
		 gpa = scan.nextDouble();
		 if (classYear == 4)
		 {
		 	if(gpa>=3.5)
		 		
		 	

		 }
		 return "You can graduate";
		
	}
}
