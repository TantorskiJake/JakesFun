
public class Stapler 
{
	//********Instance Variables********

		//DO NOT ADD, DO NOT CHANGE
		private int myStaples;		//how many staples in stapler
		private int myCapacity;		//how many staples it can hold
		private boolean myClosed;	//is stapler closed? true is closed, false is open


		//********Constructors********

		//Default constructor.
		//Set to: zero staples, capacity 250, closed.
		public Stapler()
		{
			myStaples = 0;
			myCapacity = 250;
			myClosed= true;



		}

		//Regular constructor.  Initialize instance variables with
		//provided values.  Assume user will use valid values for all.
		public Stapler(int staples, int capacity, boolean closed)
		{
			myStaples = staples;
			myCapacity = capacity;
			myClosed= closed;

		}

			//********Mutator Methods (change values) ********

		//Close the stapler
		public void closeStapler()
		{
			myClosed = true;
		}

		//Open the stapler
		public void openStapler()
		{
			myClosed = false;
		}

	 

		//Subtract a single staple.  The stapler can
		//staple only when already closed AND when it HAS STAPLES (you may not close it).
		//**Both** conditions **must** be true to staple.
		//HINT:  Requires one or more IF statements.
		public void staple()
		{

			if(myStaples >= 1 && myClosed==true)
				myStaples= myStaples - 1;


		}

		//Increase staples up to the maximum capacity.
		//The stapler must already be OPEN to add staples (you may not open it).
		//HINT: Requires IF statement(s) to make sure stapler is already open
		//and to make sure you fill it up to, BUT NOT BEYOND capacity.
		public void addStaples(int moreStaples)
		{



			myStaples = myCapacity;


		}


		//********Accessor Methods (return values) ********

		//returns number of staples
		public int numStaples()
		{
			return myStaples;
		}

		//returns capacity of stapler
		public int getCapacity()
		{
			return myCapacity;
		}

		//returns open/closed status of stapler
		public boolean isClosed()
		{
			return myClosed;
		}


}
