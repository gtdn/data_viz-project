import urllib.request
import json, requests
import datetime
from colorama import Fore, Back, Style
import sys



def getResponse(url):
    global Logs
    code = 0;
    try:
        operUrl = urllib.request.urlopen(url)
        data = operUrl.read()
        jsonData = json.loads(data)
        error = False
        code = operUrl.getcode()
    except Exception as e:
        Logs.append("\n"+str(e)+",\nerror while getting ressources from url: "+url)
        error = True
        print(Fore.RED,"\n",str(e),",\nerror while getting ressources from url: ",url)
        jsonData = []

    return (error,jsonData)

with open('data/history/watch-history_3.json') as f:
    data = json.load(f)

#Output Data
dataFile =  "data/test.json"
with open(dataFile) as f:
    previousData = json.load(f)

Logs = []
#Youtube Api Key
apiKey = 'AIzaSyAQFsBExlOlauTxsMC0LyGlN34Dcq5KtaI'

#List autres Api Key :
# AIzaSyBS-E56Er8bAkNy4GsqsdhmEZ-9Yy38iXA
# AIzaSyAQFsBExlOlauTxsMC0LyGlN34Dcq5KtaI
# AIzaSyAIWWyRZO5iJ6VvQLe3nqAIiryeTfpmYRU
# AIzaSyDnzeGQuCgEYqvkn6crJGoNWLMgbZHqAJI
#Api Key Timothee : AIzaSyBZ-BcTFC8CFSfr4O5k_MrzpfuGw7j2H3U

#Start and End scrapping data
#debut = 9609
#fin = 9700#len(data)-1

debut = 9912
fin = len(data)-1

datasRetour = []
error = False
for i,d in enumerate(data):
    if error==False:
        if i >= debut and i < fin:
            #if i%100 == 0:
            sys.stdout.flush()
            print(Fore.GREEN,"\rScrapping in progress, ",i-debut+1,"/",fin-debut,end=' ')
            try:
                video_id = d['titleUrl'][32:]
                url = "https://www.googleapis.com/youtube/v3/videos?part=id%2C+snippet&id="+video_id+"&key="+apiKey
                error, jsonData = getResponse(url)
                jsonData["date"] = d['time']
                datasRetour.append(jsonData)
            except  Exception as e:
                Logs.append('error type :'+str(e)+' during iteration :'+str(i)+'\n')
                print(Fore.RED,'\n error type :',e,' during iteration :',i)
    else:
        Logs.append('error during : '+str(i)+'code error : '+str(error)+'\n')

        print(Fore.RED,'\n error during : ',i,'code error : ',error)
        break;
#Errors Logfiles
logsFile = open('archives/logs.txt', 'a')
current_time = datetime.datetime.now()
logsFile.write("\n\n========= Scrap, Time = "+str(current_time)+" ======= \n")
logsFile.writelines(Logs)
logsFile.write("Start at: "+str(debut)+", Stopped at: "+str(i)+". Write in file: "+str(dataFile)+". Resulting: "+str(len(Logs))+" errors for "+str(i - debut)+" lines. Tx error: "+str(len(Logs)/(i-debut)))
print(Fore.WHITE,"Start at: "+str(debut)+", Stopped at: "+str(i)+". Write in file: "+str(dataFile)+". Resulting: "+str(len(Logs))+" errors for "+str(i - debut)+" lines. Tx error: "+str(len(Logs)/(i-debut)))
datasRetour = previousData + datasRetour
datasJson = json.dumps(datasRetour, ensure_ascii=False, indent=4)
with open(dataFile, 'w') as f:
    f.write(datasJson)
