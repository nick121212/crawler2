##导出楼盘
    ENV=production node . export excel -i crawler.loupan -t all -f loupan.txt -F province,city,area,plate,downPayment,monthPayment,startTime,deliveryTime,buildingType,propertyAge,decorationStandard,volumeRate,greeningRate,totalHouseholds,floorInfo,jobProgress,name,price,type,developerName,district,address,sellPhone,latestNews,latestComment,sellAddress,propertyFee,propertyCompany,parkingAmount,totalPrice
##导出小区(lianjia,anjuke)
    ENV=production node . export excel -i crawler.community -t lianjia -f community.lianjia.txt -F name,address,plate,city,area,averagePriceUnit,averagePrice,refPriceUnit,refPrice,buildingTime,propertyFee,propertyCompany,developerName,roomAmount,buildingAmount,volumeRate,greeningRate
    ENV=production node . export excel -i crawler.community -t anjuke  -f community.anjuke.txt -F name,address,city,area,averagePriceUnit,averagePrice,buildingTime,propertyFee,propertyCompany,developerName,roomAmount,buildingAmount,volumeRate,greeningRate,tags
##导出二手房
    ENV=production node . export excel -i crawler.rooms -t all -f room.txt -F community,layout,sumArea,sumPrice,price,floor,decoration,toward,downPayment,monthPayment,sellingPoint,address,plate,completeTime,propertyAge,no,floorScale,prevTrade,type,yearLimit,isOnly,ift
##导出经纪人
    ENV=production node . export excel -i crawler.brokers -t all -f brokers.txt -F phone1,avatar,company,store,introduce,name,sax,features,Career
##导出二手房
    ENV=production node . export excel -i crawler.room -t all -f rooms.txt -F sellingPoint,community,layout,sumArea,floor,decoration,toward,downPayment,monthPayment,price,sumPrice,address,plate,completingTime,lift,floorScale,propertyAge,propertyType,prevTrade,type,yearLimit,isOnly


    ENV=production node . export excel -i crawler.community_layouts -t all -f community_layouts.anjuke.txt -F name,layouts
    ENV=production node . export excel -i crawler.community -t anjuke-1 -f community.anjuke.txt -F name,address,type,parkingAmount,buildingAmount,desc
    ENV=production node . export excel -i community -t lianjia -f community.lianjia.txt -F name,plate,address,type,propertyFee,propertyCompany,developerCompany,averagePrice,refAveragePrice