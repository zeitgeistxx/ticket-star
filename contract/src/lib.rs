#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env,
};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum TicketStatus {
    Issued = 0,
    CheckedIn = 1,
    Refunded = 2,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Ticket {
    pub id: u32,
    pub event_id: u32,
    pub owner: Address,
    pub status: TicketStatus,
    pub price: i128,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct EventInfo {
    pub id: u32,
    pub organizer: Address,
    pub ticket_price: i128,
    pub max_tickets: u32,
    pub tickets_sold: u32,
    pub settled: bool,
    pub total_funds: i128,
}

#[contracttype]
pub enum DataKey {
    Event(u32),
    Ticket(u32),
    Admin,
}

#[contract]
pub struct EventTicketingContract;

#[contractimpl]
impl EventTicketingContract {
    // Initialize the contract with an admin (optional check-in authority or platform registry)
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().persistent().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        env.storage().persistent().set(&DataKey::Admin, &admin);
    }

    // Create a new event
    pub fn create_event(
        env: Env,
        event_id: u32,
        organizer: Address,
        ticket_price: i128,
        max_tickets: u32,
    ) {
        organizer.require_auth();

        if ticket_price < 0 {
            panic!("Price must be non-negative");
        }
        if max_tickets == 0 {
            panic!("Max tickets must be greater than zero");
        }

        let key = DataKey::Event(event_id);
        if env.storage().persistent().has(&key) {
            panic!("Event already exists");
        }

        let event_info = EventInfo {
            id: event_id,
            organizer,
            ticket_price,
            max_tickets,
            tickets_sold: 0,
            settled: false,
            total_funds: 0,
        };

        env.storage().persistent().set(&key, &event_info);
        env.events().publish((symbol_short!("ev_creat"), event_id), ticket_price);
    }

    // Issue a ticket to a buyer on payment
    pub fn buy_ticket(
        env: Env,
        event_id: u32,
        ticket_id: u32,
        buyer: Address,
        paid_amount: i128,
    ) {
        buyer.require_auth();

        let event_key = DataKey::Event(event_id);
        if !env.storage().persistent().has(&event_key) {
            panic!("Event does not exist");
        }

        let mut event_info: EventInfo = env.storage().persistent().get(&event_key).unwrap();
        if event_info.tickets_sold >= event_info.max_tickets {
            panic!("Sold out");
        }

        if paid_amount < event_info.ticket_price {
            panic!("Insufficient payment amount");
        }

        let ticket_key = DataKey::Ticket(ticket_id);
        if env.storage().persistent().has(&ticket_key) {
            panic!("Ticket ID already exists");
        }

        let ticket = Ticket {
            id: ticket_id,
            event_id,
            owner: buyer.clone(),
            status: TicketStatus::Issued,
            price: event_info.ticket_price,
        };

        event_info.tickets_sold += 1;
        event_info.total_funds += event_info.ticket_price;

        env.storage().persistent().set(&event_key, &event_info);
        env.storage().persistent().set(&ticket_key, &ticket);

        env.events().publish((symbol_short!("tk_buy"), event_id, ticket_id), buyer);
    }

    // Scan & check in a ticket
    pub fn check_in(env: Env, ticket_id: u32, verifier: Address) {
        verifier.require_auth();

        let ticket_key = DataKey::Ticket(ticket_id);
        if !env.storage().persistent().has(&ticket_key) {
            panic!("Ticket does not exist");
        }

        let mut ticket: Ticket = env.storage().persistent().get(&ticket_key).unwrap();
        if ticket.status != TicketStatus::Issued {
            panic!("Ticket is not valid for check-in");
        }

        let event_key = DataKey::Event(ticket.event_id);
        let event_info: EventInfo = env.storage().persistent().get(&event_key).unwrap();

        // The verifier must be the event organizer or the admin
        let admin: Option<Address> = env.storage().persistent().get(&DataKey::Admin);
        let is_admin = admin.map_or(false, |a| verifier == a);
        if verifier != event_info.organizer && !is_admin {
            panic!("Unauthorized verifier");
        }

        ticket.status = TicketStatus::CheckedIn;
        env.storage().persistent().set(&ticket_key, &ticket);

        env.events().publish((symbol_short!("tk_check"), ticket.event_id, ticket_id), true);
    }

    // Refund ticket
    pub fn refund_ticket(env: Env, ticket_id: u32, organizer: Address) {
        organizer.require_auth();

        let ticket_key = DataKey::Ticket(ticket_id);
        if !env.storage().persistent().has(&ticket_key) {
            panic!("Ticket does not exist");
        }

        let mut ticket: Ticket = env.storage().persistent().get(&ticket_key).unwrap();
        if ticket.status != TicketStatus::Issued {
            panic!("Ticket cannot be refunded");
        }

        let event_key = DataKey::Event(ticket.event_id);
        let mut event_info: EventInfo = env.storage().persistent().get(&event_key).unwrap();

        if organizer != event_info.organizer {
            panic!("Only event organizer can issue refunds");
        }

        ticket.status = TicketStatus::Refunded;
        event_info.tickets_sold -= 1;
        event_info.total_funds -= ticket.price;

        env.storage().persistent().set(&ticket_key, &ticket);
        env.storage().persistent().set(&event_key, &event_info);

        env.events().publish((symbol_short!("tk_ref"), ticket.event_id, ticket_id), ticket.owner);
    }

    // Settle event payout to organizer
    pub fn settle_event(env: Env, event_id: u32, organizer: Address) {
        organizer.require_auth();

        let event_key = DataKey::Event(event_id);
        if !env.storage().persistent().has(&event_key) {
            panic!("Event does not exist");
        }

        let mut event_info: EventInfo = env.storage().persistent().get(&event_key).unwrap();
        if organizer != event_info.organizer {
            panic!("Unauthorized event organizer");
        }

        if event_info.settled {
            panic!("Event already settled");
        }

        event_info.settled = true;
        env.storage().persistent().set(&event_key, &event_info);

        env.events().publish((symbol_short!("ev_settl"), event_id), event_info.total_funds);
    }

    // Fetch Event details
    pub fn get_event(env: Env, event_id: u32) -> EventInfo {
        let key = DataKey::Event(event_id);
        env.storage().persistent().get(&key).unwrap()
    }

    // Fetch Ticket details
    pub fn get_ticket(env: Env, ticket_id: u32) -> Ticket {
        let key = DataKey::Ticket(ticket_id);
        env.storage().persistent().get(&key).unwrap()
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn test_contract_lifecycle() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(EventTicketingContract, ());
        let client = EventTicketingContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let organizer = Address::generate(&env);
        let buyer = Address::generate(&env);

        // Initialize admin
        client.initialize(&admin);

        // Create Event #1
        client.create_event(&1, &organizer, &100, &50);
        let event = client.get_event(&1);
        assert_eq!(event.id, 1);
        assert_eq!(event.ticket_price, 100);
        assert_eq!(event.max_tickets, 50);
        assert_eq!(event.tickets_sold, 0);
        assert!(!event.settled);

        // Buy Ticket #1001
        client.buy_ticket(&1, &1001, &buyer, &100);
        let ticket = client.get_ticket(&1001);
        assert_eq!(ticket.id, 1001);
        assert_eq!(ticket.event_id, 1);
        assert_eq!(ticket.owner, buyer);
        assert_eq!(ticket.status, TicketStatus::Issued);

        let updated_event = client.get_event(&1);
        assert_eq!(updated_event.tickets_sold, 1);
        assert_eq!(updated_event.total_funds, 100);

        // Check in Ticket #1001 by Organizer
        client.check_in(&1001, &organizer);
        let checked_ticket = client.get_ticket(&1001);
        assert_eq!(checked_ticket.status, TicketStatus::CheckedIn);

        // Settle Event
        client.settle_event(&1, &organizer);
        let settled_event = client.get_event(&1);
        assert!(settled_event.settled);
    }

    #[test]
    fn test_refund_flow() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(EventTicketingContract, ());
        let client = EventTicketingContractClient::new(&env, &contract_id);

        let organizer = Address::generate(&env);
        let buyer = Address::generate(&env);

        client.create_event(&2, &organizer, &50, &10);
        client.buy_ticket(&2, &2001, &buyer, &50);

        // Refund ticket
        client.refund_ticket(&2001, &organizer);
        let ticket = client.get_ticket(&2001);
        assert_eq!(ticket.status, TicketStatus::Refunded);

        let event = client.get_event(&2);
        assert_eq!(event.tickets_sold, 0);
        assert_eq!(event.total_funds, 0);
    }

    #[test]
    #[should_panic(expected = "Unauthorized verifier")]
    fn test_unauthorized_checkin() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(EventTicketingContract, ());
        let client = EventTicketingContractClient::new(&env, &contract_id);

        let organizer = Address::generate(&env);
        let buyer = Address::generate(&env);
        let stranger = Address::generate(&env);

        client.create_event(&3, &organizer, &20, &10);
        client.buy_ticket(&3, &3001, &buyer, &20);

        // Stranger trying to check in should panic
        client.check_in(&3001, &stranger);
    }
}
