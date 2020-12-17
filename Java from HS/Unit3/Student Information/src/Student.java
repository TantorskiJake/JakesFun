//Jake Tantorski 11/3/16
import java.util.Scanner;
public class Student 
{
	Scanner scan = new Scanner(System.in);
	
	//instance variables
		private String fName;
		private String lName;
		private int id;
		private double sumOfGrades;
		private int numOfGrades;
		
		//default constructor
		public Student()
		{
			fName = "";
			lName = "";
			id = 0;
			//must initialize it
			sumOfGrades = 0.0;
			numOfGrades = 0;
		}
		
		//constructs student with 3 parameters
		public Student(String firstName, String lastName, int idNumber)
		{
			fName = firstName;
			lName = lastName;
			id=idNumber;
			sumOfGrades = 0.0;
			numOfGrades = 0;
		}
		
		//returns name of student
		public String getName()
		{
			return fName + " " + lName;
		}
		
		//adds a letter grade in numerical format
		public void addGrade(double grade)
		{
			sumOfGrades+= grade;
			numOfGrades++;
		} 
		
		//returns student id
		public int getId()
		{
			return id;
		}
		
		//calculates & returns Gpa
		public double getGPA ()
		{
			return sumOfGrades/numOfGrades;
		}


}
