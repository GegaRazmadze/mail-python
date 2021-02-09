document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  document.querySelector("#compose-form").addEventListener('submit', function (event) {
    event.preventDefault();
    send_mail_post();
  });
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // render Eamails
  showEmails(mailbox);
}

// GET requested mails 
function showEmails(mailbox) {

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {

    emails.forEach(email => {
         // Create new post
    const set_email = document.createElement('div');
    set_email.className = 'email';
    if  (mailbox === "inbox") {
      set_email.innerHTML = `<span>Sender: ${email.sender}</span>   <span>Subject: ${email.subject}</span>    <span>Date: ${email.timestamp}</span>`;
        //set read unread styles:
        if (email.read === true) {
          set_email.style.background = 'gray';
        } else {
          set_email.style.background = 'white';
        }
      } else {
        set_email.innerHTML = `<span>To: ${email.recipients}</span>   <span>Subject: ${email.subject}</span>    <span>Date: ${email.timestamp}</span>`;
      }

      // add event listener
      set_email.addEventListener('click', () => {
        
        load_mail(email, mailbox);
      });

      // Add post to DOM
      document.querySelector('#emails-view').append(set_email);
    })

  });
}

// Add a new post with given contents to DOM
function load_mail(email, mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = '';

  // mark as Read email:
  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })

  // Create View of Email
  const element = document.createElement('div');

  // Create Button for Replay:
  const buttonReplay = document.createElement('button');
  buttonReplay.innerHTML = 'Replay';
  buttonReplay.className = 'replay_button';
  // create button for archive and unArchive
  const buttonArch = document.createElement('button');
  buttonArch.className = 'archive_button';

  if (email.archived === false) {
    buttonArch.innerHTML = 'Archive'
  } else {
    buttonArch.innerHTML = 'UnArchive'
  }

  element.innerHTML = `<h1>${email.subject}</h1> 
  <div class="email_info">
  <p>${email.timestamp}</p>
  <p>From: ${email.sender}</p>
  <p>To: ${email.recipients}</p>
  </div>
  <div class="email_body">${email.body}</div>`;

  // Archive ivent Listener:
  buttonArch.addEventListener('click', () => {
    if (email.archived === false) {
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          archived: true
        })
      })
    } else {
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          archived: false
        })
      })
    }
    load_mailbox('inbox')
  });

  // check email is sent or not 
  user_id = document.querySelector('#user_id').innerHTML;
  if (user_id !== email.sender) {
    document.querySelector('#emails-view').append(buttonArch, buttonReplay);
  }

  document.querySelector('#emails-view').append(element);


  buttonReplay.addEventListener('click', () => {
    reply_mail(email.sender, email.subject , email.body, email.timestamp)
  });

  // ///////////////////////////////////////////////////////// DELETE //////////////////////////// DELETE ////////////////////////////////
  console.log(email);
};

//replay mail
function reply_mail(sender, subject, body, timestamp) {
  // render compose_email:
  compose_email();
  //check if subjecti is filled:
  if (!/^Re:/.test(subject)) subject = `Re: ${subject}`;
  //Set Value
  document.querySelector("#compose-recipients").value = sender;
  document.querySelector("#compose-subject").value = subject;

  //replay body
  pre_fill = `\r                 <<<---------- On ${timestamp} ${sender}  ---------->>> \n\n\nwrote:\n${body}\n`;

  document.querySelector("#compose-body").value = pre_fill;
}
  

// compose_send mail
function send_mail_post () {


  //take  filled Values from:
  const to = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const text = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: to,
        subject: subject,
        body: text
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
  });

  //redirect to sent page
  load_mailbox('sent');
}



