//***************************************************************
//	Coin.java
//	Represents a coin with two sides that can be flipped
//**************************************************************

public class Coin 
{
	public final int HEADS = 0;
	public final int TAILS = 1;
	
	private int face;
	
	//sets up the coin by flipping it initially
	public Coin()
	{
		flip();
	}
	
	//flips the coin by randomly choosing a face
	public void flip()
	{
		face = (int) (Math.random()*2);
	}
	
	//returns the current face of the coin as an integer
	public int getFace()
	{
		return face;
	}
	
	//Returns true if the current face of the coin is head
	public boolean isHeads()
	{
		if(face == HEADS)
		     return true;
		else
		     return false;
	}
	
	//returns the current face of the coin as string
	public String toString()
	{
		String faceName;
		
		if(face == HEADS)
			faceName = "HEADS";
		else
			faceName = "TAILS";
		
		return faceName;
	}
	
}
