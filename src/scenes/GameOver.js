// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import SupabaseService from '../services/SupabaseService.js';
/* END-USER-IMPORTS */

export default class GameOver extends Phaser.Scene {

	constructor() {
		super("GameOver");

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	/** @returns {void} */
	editorCreate() {

		// background
		const background = this.add.image(640, 366, "background");
		background.scaleY = 1.2;

		// playerholderSprite
		const playerholderSprite = this.add.sprite(232, 540, "playerstand", 0);
		playerholderSprite.scaleX = 1.444944303492753;
		playerholderSprite.scaleY = 1.444944303492753;
		playerholderSprite.play("playerstandplayerstand");

		this.events.emit("scene-awake");
	}

	/* START-USER-CODE */

	// Write your code here

	create() {
		// Create the basic scene elements
		this.editorCreate();
        
		// Load sound effects
		this.popupSound = this.sound.add('popup');
		this.submitSfx = this.sound.add('submitsfx');
		this.logSfx = this.sound.add('logsfx');
        
		// Play popup sound when game over appears
		this.popupSound.play();

		// Add a semi-transparent black background overlay
		const blackBackground = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000);
		blackBackground.setOrigin(0, 0);
		blackBackground.setAlpha(0.7);

		// Create the leaderboard panel
		this.createLeaderboardPanel();
	
		// Add Game Over text
		const gameOverText = this.add.text(this.cameras.main.centerX - 200, 150, "GAME OVER", {
			fontFamily: "ApexMk2-BoldExtended",
			fontSize: 72,
			color: "#ffffff",
			fontStyle: "bold"
		});
		gameOverText.setOrigin(0.5);
		gameOverText.setShadow(2, 2, "#000000", 3, true, true);

		// Add Score text
		const scoreText = this.add.text(this.cameras.main.centerX - 200, 250, "SCORE", {
			fontFamily: "ApexMk2-BoldExtended",
			fontSize: 48,
			color: "#ffffff",
			fontStyle: "bold"
		});
		scoreText.setOrigin(0.5);
		scoreText.setShadow(2, 2, "#000000", 3, true, true);
		
		// Add Score value
		const scoreValue = this.add.text(this.cameras.main.centerX - 200, 320, "100000", {
			fontFamily: "ApexMk2-BoldExtended",
			fontSize: 64,
			color: "#ffffff",
			fontStyle: "bold"
		});
		scoreValue.setOrigin(0.5);
		scoreValue.setShadow(2, 2, "#000000", 3, true, true);
		
		// Get the score passed from Level.js using scene.settings.data instead of registry
		const score = this.scene.settings.data?.score || 0;
		scoreValue.setText(score.toString());
		
		// Store the score in the class to access it later for submission
		this.playerScore = score;
		
		// Store the score in registry too for backwards compatibility
		this.registry.set('score', score);
		
		// Existing Game Over text animation
		gameOverText.setScale(0.5);
		gameOverText.setAlpha(0);
		
		// Animate Game Over text
		this.tweens.add({
			targets: gameOverText,
			scale: 1,
			alpha: 1,
			duration: 1000,
			ease: 'Bounce.Out',
			onComplete: () => {
				// Animate score text and value after Game Over animation
				scoreText.setAlpha(0);
				scoreValue.setAlpha(0);
				
				this.tweens.add({
					targets: [scoreText, scoreValue],
					alpha: 1,
					duration: 500,
					delay: 200,
					onComplete: () => {
						// Create HTML form for player name submission
						this.createSubmissionForm();
						
						// Load leaderboard data after animations complete
						this.loadLeaderboardData();
					}
				});
				
				// Continue with existing pulse animation
				this.tweens.add({
					targets: gameOverText,
					scale: { from: 1, to: 1.05 },
					duration: 800,
					yoyo: true,
					repeat: -1,
					ease: 'Sine.InOut'
				});
			}
		});
			
		// Create Restart button - positioned under score with updated styling
		this.restartButton = this.add.text(this.cameras.main.centerX - 200, 450, "RESTART", {
			fontFamily: "ApexMk2-BoldExtended",
			fontSize: 28,
			color: "#000000", // Changed to black text
			padding: { x: 40, y: 20 }
		});
		this.restartButton.setOrigin(0.5);
		// Initially not interactive - will be enabled after animation
		// this.restartButton.setInteractive({ useHandCursor: true });
		this.restartButton.setBackgroundColor('#ADADAE'); // Updated to light gray
		this.restartButton.setStroke(null); // Explicitly remove stroke
		// Make corners more round by adding custom shape
		const restartGraphics = this.add.graphics();
		restartGraphics.fillStyle(0xADADAE); // Light gray
		restartGraphics.lineStyle(4, 0x000000, 1); // Increased stroke width from 2px to 4px
		restartGraphics.fillRect(
			this.restartButton.x - this.restartButton.width / 2,
			this.restartButton.y - this.restartButton.height / 2,
			this.restartButton.width,
			this.restartButton.height
		);
		// Draw the stroke after filling to ensure it's visible on top
		restartGraphics.strokeRect(
			this.restartButton.x - this.restartButton.width / 2,
			this.restartButton.y - this.restartButton.height / 2,
			this.restartButton.width,
			this.restartButton.height
		);
		this.restartButton.setDepth(1);
		this.restartButton.on('pointerover', () => this.restartButton.setAlpha(0.8));
		this.restartButton.on('pointerout', () => this.restartButton.setAlpha(1));
		this.restartButton.on('pointerdown', () => {
			this.submitSfx.play();
			this.scene.start('Level');
		});
		
		// Create Home button - positioned with more gap
		this.homeButton = this.add.text(this.cameras.main.centerX - 200, 550, "HOME", {
			fontFamily: "ApexMk2-BoldExtended",
			fontSize: 28,
			color: "#000000", // Changed to black text
			padding: { x: 40, y: 20 }
		});
		this.homeButton.setOrigin(0.5);
		// Initially not interactive - will be enabled after animation
		// this.homeButton.setInteractive({ useHandCursor: true });
		this.homeButton.setBackgroundColor('#ADADAE'); // Updated to light gray
		this.homeButton.setStroke(null); // Explicitly remove stroke
		// Make corners more round by adding custom shape
		const homeGraphics = this.add.graphics();
		homeGraphics.fillStyle(0xADADAE); // Light gray
		homeGraphics.lineStyle(4, 0x000000, 1); // Increased stroke width from 2px to 4px
		homeGraphics.fillRect(
			this.homeButton.x - this.homeButton.width / 2,
			this.homeButton.y - this.homeButton.height / 2,
			this.homeButton.width,
			this.homeButton.height
		);
		// Draw the stroke after filling to ensure it's visible on top
		homeGraphics.strokeRect(
			this.homeButton.x - this.homeButton.width / 2,
			this.homeButton.y - this.homeButton.height / 2,
			this.homeButton.width,
			this.homeButton.height
		);
		this.homeButton.setDepth(1);
		this.homeButton.on('pointerover', () => this.homeButton.setAlpha(0.8));
		this.homeButton.on('pointerout', () => this.homeButton.setAlpha(1));
		this.homeButton.on('pointerdown', () => {
			this.submitSfx.play();
			this.scene.start('Home');  // Change 'Menu' to 'Home'
		});
		
		// Add initial scale animation
		this.tweens.add({
			targets: [this.restartButton, this.homeButton],
			scaleX: { from: 0, to: 1 },
			scaleY: { from: 0, to: 1 },
			duration: 300,
			ease: 'Back.out',
			delay: 1000,
			onComplete: () => {
				// Enable buttons after animation completes
				this.restartButton.setInteractive({ useHandCursor: true });
				this.homeButton.setInteractive({ useHandCursor: true });
			}
		});
		
		// Initialize submission status flag
		this.submissionSuccessful = false;
	}
	
	createLeaderboardPanel() {
		const width = this.cameras.main.width;
		const height = this.cameras.main.height;
		
		// Create a black panel for the leaderboard on the right side
		this.leaderboardPanel = this.add.rectangle(
			width - 250, 
			height / 2,
			400, 
			height - 100,
			0x000000,
			0.8
		);
		
		// Add a border to the panel
		const panelBorder = this.add.graphics();
		panelBorder.lineStyle(2, 0xFFCC00, 1);
		panelBorder.strokeRect(
			this.leaderboardPanel.x - this.leaderboardPanel.width / 2,
			this.leaderboardPanel.y - this.leaderboardPanel.height / 2,
			this.leaderboardPanel.width,
			this.leaderboardPanel.height
		);
		
		// Add "LEADERBOARD" title
		this.leaderboardTitle = this.add.text(
			width - 250,
			100,
			"LEADERBOARD",
			{
				fontFamily: "ApexMk2-BoldExtended",
				fontSize: 36,
				color: "#FFCC00",
				fontStyle: "bold"
			}
		);
		this.leaderboardTitle.setOrigin(0.5, 0.5);
		this.leaderboardTitle.setShadow(2, 2, "#000000", 3, true, true);
		
		// Add column headers
		this.nickNameHeader = this.add.text(
			width - 350,
			160,
			"NICK NAME",
			{
				fontFamily: "ApexMk2-BoldExtended",
				fontSize: 20,
				color: "#FFFFFF",
				fontStyle: "bold"
			}
		);
		
		this.scoreHeader = this.add.text(
			width - 150,
			160,
			"SCORE",
			{
				fontFamily: "ApexMk2-BoldExtended",
				fontSize: 20,
				color: "#FFFFFF",
				fontStyle: "bold"
			}
		);
		this.scoreHeader.setOrigin(0.5, 0);
		
		// Add divider line under headers
		const headerDivider = this.add.graphics();
		headerDivider.lineStyle(2, 0xFFCC00, 0.8);
		headerDivider.beginPath();
		headerDivider.moveTo(width - 450, 190);
		headerDivider.lineTo(width - 50, 190);
		headerDivider.closePath();
		headerDivider.strokePath();
		
		// Create container for leaderboard entries
		this.leaderboardEntries = this.add.container(0, 200);
		
		 // Loading text removed - the container will be populated by the loadLeaderboardData method
	}
	
	async loadLeaderboardData() {
		try {
			// Clear any existing entries
			this.leaderboardEntries.removeAll(true);
			
			// Fetch top 10 scores from the database
			let leaderboardData = await SupabaseService.supabase
				.from('poli_quest_tabel')
				.select('nick_name, score')
				.order('score', { ascending: false })
				.limit(10);
				
			// If there's an error in fetching data
			if (leaderboardData.error) {
				console.error('Error fetching leaderboard data:', leaderboardData.error);
				this.showLeaderboardError();
				return;
			}
			
			// Check if we have data to display
			if (!leaderboardData.data || leaderboardData.data.length === 0) {
				this.showNoDataMessage();
				return;
			}
			
			// Display the data
			this.displayLeaderboardData(leaderboardData.data);
			
		} catch (error) {
			console.error('Error in loadLeaderboardData:', error);
			this.showLeaderboardError();
		}
	}
	
	displayLeaderboardData(data) {
		// Clear any existing entries first to ensure old messages are gone
		this.leaderboardEntries.removeAll(true);
		
		const width = this.cameras.main.width;
		let yPosition = 0;
		
		// Create container for leaderboard entries if it doesn't exist
		if (!this.leaderboardEntries) {
			this.leaderboardEntries = this.add.container(0, 200);
		}
		
		data.forEach((entry, index) => {
			// Create row background with alternating colors
			const rowBg = this.add.rectangle(
				width - 250,
				yPosition + 20,
				380,
				40,
				index % 2 === 0 ? 0x333333 : 0x222222,
				0.6
			);
			rowBg.setOrigin(0.5, 0.5);
			this.leaderboardEntries.add(rowBg);
			
			// Add position number
			const positionText = this.add.text(
				width - 430,
				yPosition,
				`${index + 1}.`,
				{
					fontFamily: "ApexMk2-BoldExtended",
					fontSize: 18,
					color: index < 3 ? "#FFCC00" : "#FFFFFF",
					fontStyle: "bold"
				}
			);
			this.leaderboardEntries.add(positionText);
			
			// Truncate nick_name if too long
			let nickName = entry.nick_name;
			if (nickName.length > 12) {
				nickName = nickName.substring(0, 9) + '...';
			}
			
			// Add nick_name
			const nameText = this.add.text(
				width - 380,
				yPosition,
				nickName,
				{
					fontFamily: "ApexMk2-BoldExtended",
					fontSize: 18,
					color: index < 3 ? "#FFCC00" : "#FFFFFF"
				}
			);
			this.leaderboardEntries.add(nameText);
			
			// Add score with formatting
			const scoreText = this.add.text(
				width - 150,
				yPosition,
				entry.score.toLocaleString(),
				{
					fontFamily: "ApexMk2-BoldExtended",
					fontSize: 18,
					color: index < 3 ? "#FFCC00" : "#FFFFFF"
				}
			);
			scoreText.setOrigin(0.5, 0);
			this.leaderboardEntries.add(scoreText);
			
			// Increment Y position for next row
			yPosition += 40;
		});
	}
	
	showLeaderboardError() {
		const width = this.cameras.main.width;
		
		// Play error sound
		this.logSfx.play();
		
		// Clear the container
		this.leaderboardEntries.removeAll(true);
		
		// Add error message
		const errorText = this.add.text(
			width - 250,
			300,
			"Error loading leaderboard.\nPlease try again later.",
			{
				fontFamily: "ApexMk2-BoldExtended",
				fontSize: 18,
				color: "#FF6666",
				align: "center"
			}
		);
		errorText.setOrigin(0.5);
		this.leaderboardEntries.add(errorText);
	}
	
	showNoDataMessage() {
		const width = this.cameras.main.width;
		
		// Clear the container
		this.leaderboardEntries.removeAll(true);
		
		// Add no data message
		const noDataText = this.add.text(
			width - 250,
			300,
			"No leaderboard data available yet.\nBe the first to submit a score!",
			{
				fontFamily: "ApexMk2-BoldExtended",
				fontSize: 18,
				color: "#FFFFFF",
				align: "center"
			}
		);
		noDataText.setOrigin(0.5);
		this.leaderboardEntries.add(noDataText);
	}
	
	createSubmissionForm() {
			// Store button states and disable them while form is open
		if (this.restartButton && this.homeButton) {
			this.restartButton.disableInteractive();
			this.homeButton.disableInteractive();
		}
		
		// Create a div element for the form container
		const formContainer = document.createElement('div');
		formContainer.id = 'scoreSubmitForm';
		formContainer.style.position = 'fixed';
		formContainer.style.width = '85%'; // Slightly reduced for very small screens
		formContainer.style.maxWidth = '400px';
		
		 // Center form in the game
		formContainer.style.left = '50%';
		formContainer.style.top = '50%';
		formContainer.style.transform = 'translate(-50%, -50%)';
		
		// Responsive padding based on screen width
		const isSmallScreen = window.innerWidth < 360;
		formContainer.style.padding = isSmallScreen ? '10px' : '20px';
		
		formContainer.style.backgroundColor = 'rgb(0, 0, 0)';
		formContainer.style.border = '2px solid #FFCC00'; // Updated to match leaderboard yellow stroke
		formContainer.style.borderRadius = '8px';
		formContainer.style.color = '#ffffff';
		formContainer.style.fontFamily = 'ApexMk2-BoldExtended, Arial, sans-serif';
		formContainer.style.textAlign = 'center';
		formContainer.style.zIndex = '1000';
		formContainer.style.boxShadow = '0 0 10px rgba(255, 204, 0, 0.5)'; // Updated to match yellow glow
		formContainer.style.transition = 'opacity 0.5s ease';
		formContainer.style.opacity = '0';
		formContainer.style.overflowY = 'auto'; // Allow scrolling if needed
		formContainer.style.maxHeight = '90vh'; // Prevent overflow on small screens
		
		 // Create form HTML content with responsive styling and error message area
		formContainer.innerHTML = `
			<div style="position:relative;">
				<button id="closeFormBtn" style="position:absolute;top:-10px;right:-10px;background:#ff0000;color:white;border:none;width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:18px;line-height:1;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 4px rgba(0,0,0,0.2);">×</button>
				<h3 style="margin-top:0;color:#FFCC00;font-size:clamp(16px, 4.5vw, 24px);">SUBMIT YOUR SCORE</h3>
				<div id="errorMessage" style="color:#ff4d4d;font-size:12px;margin-bottom:8px;min-height:18px;display:none;"></div>
				<form id="scoreForm">
					<div style="margin-bottom:12px;">
						<label for="playerName" style="display:block;margin-bottom:4px;font-size:clamp(12px, 3.8vw, 16px);">NICK NAME:</label>
						<input type="text" id="playerName" name="playerName" style="width:100%;box-sizing:border-box;padding:6px;background:rgba(255,255,255,0.9);border:1px solid #FFCC00;border-radius:4px;font-size:14px;" required>
					</div>
					<div style="margin-bottom:12px;">
						<label for="bscAddress" style="display:block;margin-bottom:4px;font-size:clamp(12px, 3.8vw, 16px);">BSC ADDRESS:</label>
						<input type="text" id="bscAddress" name="bscAddress" style="width:100%;box-sizing:border-box;padding:6px;background:rgba(255,255,255,0.9);border:1px solid #FFCC00;border-radius:4px;font-size:14px;" required>
					</div>
					<div style="display:flex;justify-content:center;">
						<button type="submit" style="background:#FFCC00;color:black;border:none;padding:8px 16px;border-radius:4px;font-family:ApexMk2-BoldExtended,Arial,sans-serif;font-size:clamp(12px, 3.8vw, 16px);cursor:pointer;transition:background 0.3s;width:100%;max-width:180px;">SUBMIT</button>
					</div>
				</form>
			</div>
		`;
		
		document.body.appendChild(formContainer);
		
		// Fade in the form after a short delay
		setTimeout(() => {
			formContainer.style.opacity = '1';
		}, 300);
		
		// Add event listeners to form with validation
		document.getElementById('scoreForm').addEventListener('submit', (e) => {
			e.preventDefault();
			const playerName = document.getElementById('playerName').value.trim();
			const bscAddress = document.getElementById('bscAddress').value.trim();
			const errorMsg = document.getElementById('errorMessage');
			
			// Validate form inputs
			if (!playerName) {
				this.logSfx.play(); // Play error sound
				errorMsg.textContent = "NICK NAME is required!";
				errorMsg.style.display = "block";
				return;
			}
			
			if (!bscAddress) {
				this.logSfx.play(); // Play error sound
				errorMsg.textContent = "BSC ADDRESS is required!";
				errorMsg.style.display = "block";
				return;
			}
			
			 // Comprehensive BSC address validation
			if (!bscAddress.startsWith('0x')) {
				this.logSfx.play(); // Play error sound
				errorMsg.textContent = "BSC address must start with '0x'!";
				errorMsg.style.display = "block";
				return;
			}
			
			if (bscAddress.length !== 42) {
				this.logSfx.play(); // Play error sound
				errorMsg.textContent = "BSC address must be exactly 42 characters long!";
				errorMsg.style.display = "block";
				return;
			}
			
			// Check that all characters after "0x" are valid hex digits
			const hexRegex = /^0x[0-9a-fA-F]{40}$/;
			if (!hexRegex.test(bscAddress)) {
				this.logSfx.play(); // Play error sound
				errorMsg.textContent = "BSC address must contain only hexadecimal characters (0-9, a-f, A-F)!";
				errorMsg.style.display = "block";
				return;
			}
			
			// Clear any error messages
			errorMsg.style.display = "none";
			
			// Submit the score
			this.handleScoreSubmission(playerName, bscAddress);
		});
		
		 // Update close button event listener
		document.getElementById('closeFormBtn').addEventListener('click', () => {
			this.submitSfx.play();
			this.cleanupForm(); // Only close the form without scene transition
		});
	}
	
	handleScoreSubmission(playerName, bscAddress) {
		// Get the score from the class property instead of registry
		const score = this.playerScore || 0;
		
		// Play submit sound
		this.submitSfx.play();
		
		// Here you would implement your score submission logic
		console.log(`Score submitted: Player ${playerName} with BSC address ${bscAddress} scored ${score}`);
		
		 // Submit the score to the database with proper async handling
		SupabaseService.savePlayerData({
			nick_name: playerName,
			bsc_adress: bscAddress,
			score: score
		}).then(response => {
			// Check if there was an error in the response
			if (response && response.error) {
				console.error('Error saving score:', response.error);
				this.logSfx.play(); // Play error sound
				return;
			}
			
			// Play success sound
			this.logSfx.play();
			
			// Set submission as successful
			this.submissionSuccessful = true;
			
			// Refresh leaderboard data after submission with a slight delay
			// to allow database to update
			setTimeout(() => {
				this.loadLeaderboardData();
			}, 500);
		}).catch(error => {
			// Play error sound
			this.logSfx.play();
			console.error('Error saving score:', error);
		});
		
		// Show thank you message with responsive styling
		const formContainer = document.getElementById('scoreSubmitForm');
		formContainer.innerHTML = `
			<div style="position:relative;">
				<button id="closeFormBtn" style="position:absolute;top:-10px;right:-10px;background:#ff0000;color:white;border:none;width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:18px;line-height:1;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 4px rgba(0,0,0,0.2);">×</button>
				<div style="background-color:rgba(40, 167, 69, 0.2);border:1px solid #28a745;border-radius:4px;padding:8px;margin-bottom:16px;">
					<h3 style="margin-top:0;color:#28a745;font-size:clamp(16px, 4.5vw, 24px);">SUCCESS!</h3>
					<p style="font-size:clamp(12px, 3.8vw, 16px);margin-bottom:8px;">Your score has been submitted.</p>
				</div>
				<h3 style="margin-top:0;color:#FFCC00;font-size:clamp(16px, 4.5vw, 24px);">THANK YOU!</h3>
				<p style="font-size:clamp(12px, 3.8vw, 16px);margin-bottom:16px;">
					Your score has been recorded under:<br>
					<strong>${playerName}</strong>
				</p>
				<button type="button" id="returnToMenu" style="background:#FFCC00;color:black;border:none;padding:8px 16px;border-radius:4px;font-family:ApexMk2-BoldExtended,Arial,sans-serif;font-size:clamp(12px, 3.8vw, 16px);cursor:pointer;width:80%;max-width:180px;">RETURN TO MENU</button>
			</div>
		`;
		
		document.getElementById('returnToMenu').addEventListener('click', () => {
			this.submitSfx.play();
			this.cleanupForm(); // Just close the form without scene transition
		});

		 // Update close button event listener after form update
		document.getElementById('closeFormBtn').addEventListener('click', () => {
			this.submitSfx.play();
			this.cleanupForm(); // Only close the form without scene transition
		});
	}
	
	cleanupForm() {
		const formContainer = document.getElementById('scoreSubmitForm');
		if (formContainer) {
			formContainer.remove();
		}
		
		// Re-enable buttons after form is closed
		if (this.restartButton && this.homeButton) {
			this.restartButton.setInteractive({ useHandCursor: true });
			this.homeButton.setInteractive({ useHandCursor: true });
		}
		
		 // Only refresh leaderboard if submission was successful
		// and not already refreshed in handleScoreSubmission
		if (this.submissionSuccessful) {
			// We already refreshed the leaderboard in handleScoreSubmission,
			// so we don't need to do it again here
			this.submissionSuccessful = false; // Reset the flag
		}
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
