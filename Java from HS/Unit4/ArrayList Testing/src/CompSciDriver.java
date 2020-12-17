import  java.util.ArrayList;
public class CompSciDriver 
{

	public static void main(String[] args) 
	{
		ArrayList<Student>  block1 = new ArrayList<Student>();
		
		block1.add(new Student("Catherina", "Rhymer"));
		block1.add(new Student("Gene", "Brandstetter"));
		block1.add(new Student("Hilario", "Huffaker"));
		block1.add(new Student("Era", "Dewald"));
		block1.add(new Student("Sana", "Rogge"));
		
		//Should print all names of students with their grades.
		//Grades will be 0
		for(int i = 0; i < block1.size(); i++)
		{
			System.out.println(block1.get(i).toString());
		}
		
		//Prints the size of the class, should be 5.
		System.out.println(block1.size());
		
		
		block1.add(new Student("Santa", "Claus"));
		
		//prints the size of class, should be 6
		System.out.println(block1.size());
		
		//replaces gene with Scott
		block1.set(1, new Student("Scott", "Haywood"));
		
		//prints all students with scott and natasha
		
		for(int i = 0; i < block1.size(); i++)
		{
			System.out.println(block1.get(i).toString());
		}
		
		
		//inserts Kiesha between Hilario & Era
		block1.add(3, new Student("Kiesha", "Stults"));
		
		//prints final class size and class list.  Class size should be 7
		block1.size();
		 System.out.println(block1.toString());
		

	}

}
