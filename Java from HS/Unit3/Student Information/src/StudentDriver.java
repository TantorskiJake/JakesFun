import java.text.DecimalFormat;
public class StudentDriver {

	public static void main(String[] args) 
	{
		DecimalFormat pizza = new DecimalFormat("0.###");
		Student ben = new Student("Ben", "William", 8675309);
		ben.addGrade(4.3);
		ben.addGrade(3.6);
		ben.addGrade(2.5);
		System.out.println(ben.getName() + "'s GPA is " + pizza.format(ben.getGPA()));

		Student carl = new Student("Carl", "Wheezer", 678999821);
		carl.addGrade(4.4);
		carl.addGrade(3.8);
		carl.addGrade(3.5);
		System.out.println(carl.getName() + "'s GPA is " + pizza.format(carl.getGPA()));

	}

}
