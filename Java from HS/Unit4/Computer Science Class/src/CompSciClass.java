
public class CompSciClass 
{
	
	Student[] roster;
	private int nextSeat;
	
	//creates an array of 5 empty seats that holds students called roster.
	//sets the first seat to be filled to 0.
	public CompSciClass()
	{
		roster = new Student[5];
		nextSeat = 0;
	}
	
	//creates an array of numOfStudents empty seats that holds students.
	//sets the first seat to be filled to 0. 
	public CompSciClass(int numOfStudents)
	{
		roster = new Student[numOfStudents];
		nextSeat = 0;
	}
	
	//adds a students to the roster at the first available seat.
	//Should call increaseRoster if nextSeat is outside array length
	public void addStudent(Student s)
	{
		//your code goes here
		if(nextSeat >= roster.length)
			increaseRoster();
		
		roster[nextSeat] = s;
		nextSeat++;
	}
	
	//returns the student at index i
	public Student getStudent(int i)
	{
		//your code goes here
		return roster[i];
	}
	
	//returns the number of students in the class.
	public int classSize()
	{
		//your code goes here
		return nextSeat;
	}
	
	//returns true if class is empty, false otherwise.
	public boolean isClassEmpty()
	{
		//your code goes here
		if(nextSeat == 0)
			return true;
		else
			return false;
	}
	
	//increases roster by 5 more empty seats
	public void increaseRoster()
	{
		//your code goes here.
		Student[] temp = new Student[roster.length + 5];
		
		for(int i = 0; i < nextSeat; i++)
		{
			temp[i] = roster[i];
		}
		
		roster = temp;
		
	}
	
	//replaces the student at the index (if available) with Student s
	public void replaceStudent(int index, Student s)
	{
		//your code goes here.
		roster[index] = s;
	}
	
	//This one is tricky.
	//This method inserts the students at the index (if available)
	//inserts means moves everything over.
	
	public void insertStudent(int index, Student s)
	{
		if(nextSeat >= roster.length)
			increaseRoster();
		
		Student[] temp = new Student[roster.length];
		int j = 0;
		
		for(int i = 0; i < nextSeat; i++)
		{
			if(j == index)
			{
				temp[j] = s;
				i--;
			}
			else
			{
				temp[j] = roster[i];
			}
			
			j++;
		}
		
		roster = temp;
		nextSeat++;
	}
	
	//print all students name in class.
	public void printAll()
	{
		for(int i = 0; i < nextSeat; i++)
		{
			System.out.println(roster[i]);
		}
	}
	
	
	
	

}
