
public class CompSciDriver 
{

	public static void main(String[] args) 
	{
		CompSciClass block1 = new CompSciClass();
		
		block1.addStudent(new Student("Catherina", "Rhymer"));
		block1.addStudent(new Student("Gene", "Brandstetter"));
		block1.addStudent(new Student("Hilario", "Huffaker"));
		block1.addStudent(new Student("Era", "Dewald"));
		block1.addStudent(new Student("Sana", "Rogge"));
		
		//Should print all names of students with their grades.
		//Grades will be 0
		block1.printAll();
		
		//Prints the size of the class, should be 5.
		System.out.println(block1.classSize());
		
		
		block1.increaseRoster();
		block1.addStudent(new Student("Natasha", "Silguero"));
		
		//prints the size of class, should be 6
		System.out.println(block1.classSize());
		
		//replaces gene with Scott
		block1.replaceStudent(1, new Student("Scott", "Haywood"));
		
		//prints all students with scott and natasha
		block1.printAll();
		
		
		//inserts Kiesha between Hilario & Era
		block1.insertStudent(3, new Student("Kiesha", "Stults"));
		
		//prints final class size and class list.  Class size should be 7
		block1.classSize();
		block1.printAll();
		

	}

}
