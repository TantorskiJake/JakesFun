
/*
 Student class
 encapsulates and manipulates data about a single student
*/


public class Student 
{
	//instance variables
	private String fName;
	private String lName;
	private double sumOfGrades;
	private int numOfGrades;
	
	//default constructor
	public Student()
	{
		fName = "";
		lName = "";
		sumOfGrades = 0.0;
		numOfGrades = 0;
	}
	
	//constructs student with 3 parameters
	public Student(String fName, String lastName)
	{
		this.fName = fName;
		lName = lastName;
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
		sumOfGrades = sumOfGrades + grade;	//sumOfGrades += grade;
		numOfGrades++;
	}
	
	
	//calculates & returns final grade percentage
	public double getFinalGrade ()
	{
		return sumOfGrades/numOfGrades;
	}
	
	public String toString()
	{
		return getName() + ": " + getFinalGrade();
	}
	
	

}
