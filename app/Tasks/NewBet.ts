import {BaseTask} from 'adonis5-scheduler/build'
import Bet from 'App/Models/Bet'
import User from 'App/Models/User'
import { Kafka } from 'kafkajs'
import moment from 'moment'

export default class NewBet extends BaseTask {
	public static get schedule() {
		return '0 0 9 * * *'
	}
	/**
	 * Set enable use .lock file for block run retry task
	 * Lock file save to `build/tmpTaskLock`
	 */
	public static get useLock() {
		return false
	}

	public async handle() {
		const kafka = new Kafka({
			brokers: ['kafka:29092'],
		  });
		
		const lastWeek = moment().startOf('day').subtract('1', 'week').toDate()
    	
		const users = await User.query().select('*')
		
		for(let i = 0; i< users.length; i++){
			const userNoBet = await Bet.findBy('user_id', users[i].id)
			if(!userNoBet){
				if(moment(lastWeek).isAfter(users[i].createdAt)){
          const producer = kafka.producer();
          await producer.connect();
          await producer.send({
            topic: 'user-no-bet',
            messages: [
              { value: JSON.stringify(users[i])}
            ],
          });
				
				}
			}
			const bets = await Bet.query().select('*').orderBy('created_at', 'desc')
			.where('user_id', users[i].id)
			.limit(1)
			.where('created_at', '<', lastWeek)
			
			if(bets.length > 0){
				const producer = kafka.producer();
          await producer.connect();
          await producer.send({
            topic: 'user-no-bet',
            messages: [
              { value: JSON.stringify(users[i])}
            ],
          });
				
			}
		}
		
  	}
}
