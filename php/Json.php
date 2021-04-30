<?php

	function test(){

		$data =[];

		if(isset($_GET['schema'])){

			$data['schema'][] = ['id' => 'campaign_name' , 'name' => 'Campaign Name' ,'type' => 'text','description' =>'campaign name'];
			$data['schema'][] = ['id' => 'clicks' , 'name' => 'Clicks' ,'type' => 'number','description' =>'clicks'];
			$data['schema'][] = ['id' => 'impressions' , 'name' => 'Impressions' ,'type' => 'number','description' =>'impressions'];
			$data['schema'][] = ['id' => 'spend' , 'name' => 'Spend' ,'type' => 'number','description' =>'spend'];
			$data['schema'][] = ['id' => 'day' , 'name' => 'Date' ,'type' => 'date','description' =>'day'];
			echo json_encode($data);

			exit;
		}

        $sql = "select id, campaign_name ,clicks , impressions ,spend, date_stop   
        		from facebook_campaign 
        		where account_id = '{$_GET['account_id']}'
        			and date_stop >= '{$_GET['date_start']}'
        			and date_stop <= '{$_GET['date_stop']}'
        		";

		$rs = $pdo->query($sql);

		foreach ($rs as $row) {
			$data[] = [
						   'campaign_name' => $row['campaign_name'],
						   'clicks' => $row['clicks'],
						   'impressions' => $row['impressions'],
						   'spend' => $row['spend'],
						   'day' => $row['date_stop'],
						] ;
		}

		echo json_encode($data);

	}

